---
name: auth-guide
description: 認証・認可の実装状況をコードベースから調査し、学習ステップの現在地と次にやるべきことを案内する
disable-model-invocation: false
---

コードベースを調査し、認証・認可の実装状況と学習の現在地を報告してください。

## 調査対象

- `openapi.yaml` — `/auth/*` エンドポイントの有無
- `apps/api/src/db/schema/` — password_hash / session / refresh_token テーブルの有無
- `apps/api/src/routes/` — auth ルートの有無
- `apps/api/src/` — JWT 検証ミドルウェア / JWKS エンドポイントの有無
- `apps/web/src/` — 認証状態管理コードの有無
- `docker-compose.yml` — Keycloak サービスの有無

## 学習ステップ

```
--- フェーズ1: スクラッチ JWT 認証 ---
Step 1: パスワードハッシュ（users に password_hash カラム追加 / argon2 or bcrypt）
Step 2: 会員登録エンドポイント（POST /auth/register）＋ 入力バリデーション
Step 3: ログイン & JWT 発行（POST /auth/login）
Step 4: フロントエンド認証状態管理
Step 5: JWT 検証ミドルウェア
Step 6: 保護されたエンドポイント（GET /me）
Step 7: ログアウト & トークン無効化
Step 8: リフレッシュトークン ＋ レートリミット
Step 9: RBAC（ロールベースアクセス制御）

--- フェーズ2: OAuth 2.0 / OIDC への橋渡し ---
Step 10: RS256 署名に切り替えて JWKS エンドポイントを自作
         （HS256との違い・非対称署名・公開鍵配布を理解する）
Step 11: Keycloak（Docker）を立ち上げて JWT を自前コードで検証
         （Keycloak = AWS Cognito の OSS 代替 / ローカル完結）
         ・Keycloak の JWKS エンドポイントを叩いて公開鍵を取得
         ・自作の JWT 検証ロジックで Keycloak 発行トークンを検証
Step 12: OAuth 2.0 Authorization Code Flow を Keycloak で体験
         ・フロントから Keycloak にリダイレクト → コード取得 → トークン交換
         ・自作 API を Resource Server として保護
```

## 出力フォーマット

```
現在地: Step X「〇〇」

実装済み:
- ...

次のステップ: Step Y「〇〇」
なぜ必要か: ...
最初の一手: ...
```

$ARGUMENTS が指定された場合はそのトピックに絞って案内する。
