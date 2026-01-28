# Docker 基本コマンド

## 共同作業者向け: セットアップ手順（Docker）
1. リポジトリを取得: `git clone <repo_url>`
2. プロジェクトへ移動: `cd book-ledger`
3. イメージをビルド: `docker build -t book-ledger .`
4. 起動: `docker run -p 3000:3000 book-ledger`
5. アクセス: `http://localhost:3000`

## 共同作業フロー（Docker運用の例）
- 初回のみ `docker build` でイメージ作成
- 以降の変更反映は方針を決める:
  - シンプル運用: 変更のたびに `docker build` → `docker run`
  - 開発効率重視: ソースをマウントして即時反映
    - 例: `docker run -p 3000:3000 -v $(pwd):/app -w /app book-ledger npm run dev`
- 停止中コンテナが増えるのは普通。不要なら `docker container prune`

## 状態確認
- 稼働中コンテナ一覧: `docker ps`
- 全コンテナ一覧（停止中含む）: `docker ps -a`
- イメージ一覧: `docker images`
- ディスク使用量: `docker system df`

## イメージ
- ビルド: `docker build -t <name>:<tag> .`
- 削除: `docker rmi <image_id>`

## コンテナ
- 起動（新規作成）: `docker run <image>`
- ポート公開: `docker run -p 3000:3000 <image>`
- 名前指定: `docker run --name <container_name> <image>`
- 停止: `docker stop <container_id>`
- 再起動: `docker restart <container_id>`
- 削除（停止中）: `docker rm <container_id>`

## ログ・接続
- ログ確認: `docker logs <container_id>`
- フォロー: `docker logs -f <container_id>`
- コンテナ内に入る: `docker exec -it <container_id> sh`

## クリーンアップ
- 停止中コンテナ削除: `docker container prune`
- 使っていないイメージ削除: `docker image prune`
- 使っていないものを一括削除: `docker system prune`

## よく使う例
- ビルドして起動:
  1. `docker build -t book-ledger .`
  2. `docker run -p 3000:3000 book-ledger`
