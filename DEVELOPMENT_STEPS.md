# 開発手順（書籍購入費用管理アプリ）

## 1. 事前準備
- Supabase プロジェクト作成（Auth 有効化、DB作成）
- `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` を設定
- `.env` に `DATABASE_URL` を設定（Supabase Postgres）

## 2. DB設計（Prisma + Supabase）
- `prisma/schema.prisma` に `purchases` モデルを定義
- `npx prisma generate` でクライアント生成
- `npx prisma db push` でテーブル作成
- Supabase 側で RLS を有効化し、`user_id = auth.uid()` の SELECT/INSERT/UPDATE/DELETE ポリシーを設定

## 3. 認証（Supabase Auth）
- `/login` 画面を作成（ログイン/新規登録）
- 未ログイン時は保護ページへアクセスできないようにリダイレクト
- セッション管理（サーバー側で user_id を取得）

## 4. 購入登録機能
- `/new` に登録フォーム作成
- バリデーション（タイトル1〜200、価格0〜9,999,999、購入日必須）
- Server Actions で登録処理（`user_id` はサーバー側で付与）

## 5. 一覧機能
- `/purchases` に一覧表示（新しい順）
- 編集・削除の導線を追加
- 削除は確認ダイアログを表示

## 6. ダッシュボード
- `/` に今月/今年の合計を表示
- 最近の購入（最新10件）を表示
- 集計は DB の `SUM(price)` を使用

## 7. UI/UX
- shadcn/ui を導入し、フォーム・テーブル・カードを統一
- 成功/失敗時のトースト通知
- 入力エラーはフィールド直下に表示

## 8. テスト観点の確認
- 認証（新規登録/ログイン/保護ルート）
- データ隔離（他ユーザーの閲覧/更新/削除不可）
- 集計（当月/当年のみ集計、0件は0表示）

## 9. 最低限の運用
- エラーログはサーバー側で追跡可能にしておく（console/error）
- 将来的に Sentry 等へ移行できるよう構成を意識
