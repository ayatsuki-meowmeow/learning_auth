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
