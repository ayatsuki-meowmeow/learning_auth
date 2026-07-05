# トークン保管方式の移行計画

`fe-auth-integration.md` で採用した **sessionStorage**（現状）からの今後の移行計画メモ。
「動くものを作る → 保管方式を変えて脅威モデルの違いを体感する」という学習順序で進める。

## 前提：3つの保管場所と脅威

| 置き場所 | JS から読める | 主な脅威 | ブラウザに JWT が存在するか |
|--|--|--|--|
| localStorage / sessionStorage（現状） | ○ | **XSS** | する |
| httpOnly Cookie（Step A） | ✗ | **CSRF** | する（cookie jar 内） |
| BFF サーバー側保管（Step B） | ✗ | — | **しない** |

ポイント：
- **httpOnly Cookie化 ≠ BFF**。前者は「保管場所」の変更、後者は「誰が JWT を持つか（アーキテクチャ）」の変更で、別の軸。
- httpOnly Cookie にしても JWT 自体はブラウザの cookie jar に存在し続ける（JS から読めなくなるだけ）。ブラウザから完全に排除するには BFF が必要。

## Step A：httpOnly Cookie に直接保存

```
Browser ──(JWT in httpOnly Cookie)──> Hono API
```

Hono が直接 `Set-Cookie` で JWT を返す構成。BFF ではない。

学習の主眼は **守る相手が XSS → CSRF にシフトすること**。

実装ポイント:
1. **Hono 側**: ログイン成功時に `Set-Cookie` で JWT を `HttpOnly; Secure; SameSite; Path; Max-Age` 付きで返す
2. **FE 側**: sessionStorage 保存をやめ、fetch に `credentials: 'include'`（Authorization ヘッダの手動付与が不要になる → 現状の `fetcher` / `token.ts` の責務が変わる）
3. **CSRF 対策**: `SameSite=Lax/Strict` で足りるか、CSRF トークンまで要るかを検討
4. **CORS**: credentials 付きにすると `Access-Control-Allow-Credentials: true` と厳密な `Origin` 指定（ワイルドカード不可）が必須

## Step B：BFF パターンへ移行

```
Browser ──(session cookie)──> Next.js (BFF) ──(JWT)──> Hono API
```

- ブラウザは Next.js サーバーと opaque な session cookie でだけ会話
- JWT は Next.js サーバー側に保管し、ブラウザには一切渡さない
- Next.js の Route Handler / Server Action がプロキシ層として Hono API を叩く

A→B の順にやることで「BFF が追加で解決すること（＝JWT をブラウザから完全に排除）」を差分で理解する。

## 補足

- 本メモは方針のみ。各 Step の着手時に詳細設計を別途行う。
- 関連: `fe-auth-integration.md`（現状の sessionStorage 実装仕様）
