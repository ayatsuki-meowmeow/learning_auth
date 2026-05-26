# FE 認証繋ぎ込み仕様

## 全体フロー

```
openapi.yaml（/sessions, /auth/register 定義済み）
    ↓ orval generate（完了）
src/generated/sessions/sessions.ts  → useLogin フック
src/generated/auth/auth.ts          → useRegisterAuth フック
    ↓ ページから呼び出す
login page / register page
    ↓ 成功時
JWT を sessionStorage に保存
    ↓
fetcher が Authorization: Bearer <token> を自動付与
    ↓
認証済みページへ遷移
```

## トークン保存方式

**sessionStorage** を採用する。

| | localStorage | sessionStorage | httpOnly Cookie |
|--|--|--|--|
| JS から読める | ○（XSS で盗める） | ○（XSS で盗める） | ✗（JS 不可） |
| タブ閉じで消える | ✗ | ○ | ✗ |
| 実装難易度 | 低 | 低 | 中（BE 側変更も要る） |

> sessionStorage は localStorage と XSS 耐性は同じだが、タブを閉じると消える点でライフタイムが短い。
> 学習 Step として「動くものを作る → httpOnly Cookie に移行して差異を体感する」という順序を取る。
> httpOnly Cookie への移行は、BE 側の CORS・SameSite 設定と合わせて別 Step で行う。

## ディレクトリ構成

```
apps/web/
  app/
    (auth)/                    # 未ログインでもアクセス可能（route group）
      login/
        page.tsx               # ログインフォーム
      register/
        page.tsx               # 登録フォーム
    (protected)/               # 認証必須ページ群（route group）
      layout.tsx               # Server Component。AuthGuard を呼び出すシェル
      page.tsx                 # 現在の home を移動。コンテンツのみ
    layout.tsx
  src/
    components/
      auth-guard.tsx           # Client Component。sessionStorage を確認 → 未認証なら /login へ
    generated/
      sessions/sessions.ts    # useLogin（orval 生成済み）
      auth/auth.ts            # useRegisterAuth（orval 生成済み）
      model/                  # LoginRequest, LoginResponse, RegisterAuthRequest（生成済み）
    lib/
      fetcher.ts              # Authorization ヘッダ注入を追加
      token.ts                # JWT の get / set / clear（新規）
```

## 実装ステップ

| # | ファイル | 内容 |
|---|---------|------|
| 1 | `src/lib/token.ts` | sessionStorage への JWT get / set / clear |
| 2 | `src/lib/fetcher.ts` | リクエスト時に `Authorization: Bearer <token>` を付与 |
| 3 | `app/(auth)/login/page.tsx` | ログインフォーム、成功時にトークン保存 → protected へ遷移 |
| 4 | `app/(auth)/register/page.tsx` | 登録フォーム、成功時にログイン画面へ遷移 |
| 5 | `src/components/auth-guard.tsx` | sessionStorage を確認し未認証なら `/login` へリダイレクト（Client Component） |
| 6 | `app/(protected)/layout.tsx` | `AuthGuard` を呼び出すシェル（Server Component） |
| 7 | `app/(protected)/page.tsx` | 現 home を移動。コンテンツのみ |

## 各実装の詳細

### token.ts

```ts
const KEY = 'access_token'

export const tokenStorage = {
  get: (): string | null => sessionStorage.getItem(KEY),
  set: (token: string): void => sessionStorage.setItem(KEY, token),
  clear: (): void => sessionStorage.removeItem(KEY),
}
```

### fetcher.ts（変更点）

```ts
// トークンが存在する場合に Authorization ヘッダを付加する
const token = tokenStorage.get()
const headers: HeadersInit = {
  ...(options?.headers ?? {}),
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
}
```

### ルート保護の方針

`(protected)/layout.tsx`（Server Component）は薄いシェルとして `AuthGuard` を呼び出すだけにする。
認証チェックは `AuthGuard`（Client Component）が担い、sessionStorage を確認して未認証なら `/login` へリダイレクトする。
これにより `(protected)` 配下にページが増えても各ページに認証チェックを書かずに済む。

```tsx
// app/(protected)/layout.tsx
import { AuthGuard } from '@/components/auth-guard'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
```

proxy.ts による保護は JWKS 検証（Step 10）で導入するため、ここでは簡易チェックにとどめる。
