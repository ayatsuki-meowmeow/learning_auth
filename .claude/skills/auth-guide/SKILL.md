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
- `apps/api/src/` — JWT 検証ミドルウェアの有無
- `apps/web/src/` — 認証状態管理コードの有無

## 学習ステップ

```
Step 1: パスワードハッシュ（users に password_hash カラム追加 / argon2 or bcrypt）
Step 2: 会員登録エンドポイント（POST /auth/register）
Step 3: ログイン & JWT 発行（POST /auth/login）
Step 4: JWT 検証ミドルウェア
Step 5: 保護されたエンドポイント（GET /me など）
Step 6: フロントエンド認証状態管理
Step 7: リフレッシュトークン
Step 8: RBAC（ロールベースアクセス制御）
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
