# POST /sessions 設計メモ

## 決定事項

### エンドポイント設計

REST リソース志向に統一する。

| メソッド | パス | 説明 |
|---|---|---|
| POST | /sessions | ログイン（セッション＝トークンの作成） |
| DELETE | /sessions/:id | ログアウト（Step 7 で実装） |

- `openapi.yaml` の `/auth/login` → `/sessions` に変更が必要

### レイヤー構成

```
DB
└── crud/users.ts      getUserByEmail を追加（メールアドレス検索）
└── crud/auth.ts       既存の getAuthByUserId をそのまま使用

services/auth.ts       パスワード照合関数を追加（argon2id verify）
services/login.ts      上記を orchestrate して JWT を発行・返す（新規）

routes/sessions.ts     POST /sessions を定義（新規）
```

### ドメイン責務の分け方

- メールアドレスでのユーザー検索 → User ドメイン（`crud/users.ts`）
- パスワードハッシュ照合 → Auth ドメイン（`services/auth.ts`）
- JWT 発行・orchestration → Login ドメイン（`services/login.ts`）

### JWT アルゴリズム

**HS256**（対称鍵 / HMAC-SHA256）を使用する。

> 学習上の理由: Step 3 では発行・検証ともに自サーバーのみで完結するため HS256 で十分。
> RS256（非対称鍵）は Step 10 で JWKS エンドポイントを自作する際に移行し、
> 「なぜ非対称鍵が必要か」を体感するステップとして位置づける。

### アクセストークンの有効期限

**1時間**（`exp: 1h`）。

> OAuth 2.0 を採用する主要サービスも最長 1h が多く、実務感覚に合わせた値。
> リフレッシュトークン実装（Step 8）後に短縮を検討する。

### loginSchema の置き場所

`packages/schema` に追加する。

> `packages/schema` は BE・FE 共有パッケージ。
> フロントエンド実装フェーズでそのまま再利用でき、バリデーションの二重定義を防げる。

## タイミング攻撃対策の学習メモ

### DUMMY_HASH による均一化の残存制約

ユーザーが存在しない場合でも argon2id verify を走らせる（DUMMY_HASH）ことで応答時間を均一化しているが、2点の制約が残る。

**1. DB クエリ数の非対称**

| ケース | 処理 |
|--------|------|
| ユーザーが存在する | `getUserByEmail`（DB）→ `getAuthByUserId`（DB）→ argon2id verify |
| ユーザーが存在しない | `getUserByEmail`（DB）→ `Promise.resolve(undefined)`（DB なし）→ argon2id verify |

`getAuthByUserId` のネットワーク往復（~1–5ms）分の差が残る。argon2id の処理時間（~100–400ms）が支配的なため統計的手法でしか検出できないが、厳密には均一ではない。

**2. DUMMY_HASH とユーザーハッシュのコストパラメータ分離**

`registerUser` と `DUMMY_HASH` の生成箇所が独立しているため、`registerUser` 側のコストパラメータ（memory, iterations）を変更した際に `DUMMY_HASH` 側を更新し忘れると処理時間が乖離してタイミング差が生じる。

### 固定待機時間（例: 3秒）は有効か

応答時間を一律3秒にすれば制約1・2の両方を解決できるが、**別の問題が生まれる**。

- 攻撃者が大量リクエストを投げると各リクエストが3秒間コネクションを占有し続け、DoS の踏み台になりやすい
- UX も悪化する

### より現実的なパターン

「最低でも N ms はかかる」という下限保証の方が安全。

```ts
const start = Date.now();
// ... 処理 ...
const elapsed = Date.now() - start;
await sleep(Math.max(0, MIN_MS - elapsed)); // 余った時間だけ待つ
```

処理が速く終わった分だけ待つので応答時間は均一化しつつ、処理完了後すぐコネクションを解放できる。ただしこれも DoS リスクは残るため、**レートリミットと組み合わせるのが基本**。
