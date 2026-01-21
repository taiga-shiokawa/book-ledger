# 開発レポート（書籍購入費用管理アプリ）

## 1. プロジェクト作成〜初期セットアップ
- `create-next-app` で `book-ledger` を作成（TypeScript / ESLint / Tailwind / App Router）
- Supabase プロジェクト作成、`.env.local` に公開キーを設定
- Supabase Postgres の接続文字列を `.env` に設定

## 2. DB設計・Prisma
- Prisma スキーマに `purchases` を定義（uuid主キー、user_id、title、price、purchased_at、created_at、updated_at）
- `npx prisma migrate dev --name init` でテーブル作成
- RLSポリシーを `prisma/rls_policies.sql` にまとめ、Supabaseで適用

## 3. 認証（Supabase Auth）
- `/login` 画面作成（ログイン/新規登録切替）
- サインイン/サインアップ成功後は `/purchases` に遷移
- `/purchases` からログアウト可能

## 4. 購入登録・一覧・編集・削除
- `/new` に登録フォーム（バリデーション付き）
- `/purchases` に一覧表示（新しい順、削除可）
- `/purchases/[id]/edit` に編集フォーム
- Server Actions + API Route でCRUD

## 5. 集計（ダッシュボード）
- `/` に今月/今年合計を表示
- `/api/summary` でSUM集計（DB側で処理）
- 最近の購入を最大10件表示

## 6. UI/UX
- 共通ヘッダーを追加（集計/一覧/新規登録/ログアウト）
- SP時はメニューをハンバーガー表示に変更
- not-foundページを追加

## 7. デプロイ（Vercel）
- GitHub にpush後、Vercelでプロジェクト作成
- 環境変数を設定（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` / `DATABASE_URL`）
- ビルド成功後に公開

## 8. つまづいたポイントと対応
### 8.1 Prisma Client が生成されない
- エラー: `@prisma/client did not initialize yet`
- 対応: `postinstall` に `prisma generate` を追加

### 8.2 Prisma 7 の datasource 設定変更
- エラー: `datasource url is no longer supported`
- 対応: Prisma を 6.19.2 に固定

### 8.3 route.ts の型不整合
- エラー: `RouteHandlerConfig` の params 型が合わない
- 対応: `params` を `Promise<{ id: string }>` で受ける

### 8.4 implicit any
- エラー: `Parameter 'purchase' implicitly has an 'any' type`
- 対応: レスポンス用型を明示

### 8.5 binaryTargets の記述位置
- エラー: `Property not known: "binaryTargets"`
- 対応: `datasource` ではなく `generator` に移動

## 9. 現状の主要ルート
- `/`（集計ダッシュボード）
- `/login`（認証）
- `/new`（購入登録）
- `/purchases`（一覧）
- `/purchases/[id]/edit`（編集）
