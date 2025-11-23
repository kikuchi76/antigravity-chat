# 開発者向けガイド (Development Guide)

Antigravity Chatの開発環境構築および利用手順について説明します。

## 1. 前提条件

以下のツールがインストールされていることを確認してください。

*   **Node.js**: v18以上 (推奨: v20 LTS)
*   **npm**: Node.jsに同梱
*   **Docker Desktop**: データベース(PostgreSQL)の実行に必要
*   **Git**: バージョン管理

## 2. セットアップ手順

### 2.1 リポジトリのクローン

```bash
git clone https://github.com/kikuchi76/antigravity-chat.git
cd antigravity-chat
```

### 2.2 依存関係のインストール

```bash
npm install
```

### 2.3 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の内容を設定してください。
（セキュリティのため、実際の値は管理者または既存メンバーに確認してください）

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/antigravity_chat?schema=public"

# NextAuth.js
AUTH_SECRET="your-secret-key-at-least-32-chars" # `npx auth secret` で生成可能
AUTH_URL="http://localhost:3000"
```

### 2.4 データベースの起動

Dockerを使用してPostgreSQLを起動します。

```bash
docker-compose up -d
```

### 2.5 データベースのセットアップ

Prismaを使用してスキーマを適用します。

```bash
npx prisma migrate dev
```

## 3. アプリケーションの起動・停止

### 起動

以下のコマンドで開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスすると、アプリケーションが表示されます。

### 停止

開発サーバー (`npm run dev`) を停止するには、ターミナルで `Ctrl+C` を押します。

Dockerコンテナ（データベース）も停止したい場合は、以下のコマンドを実行します。

```bash
docker-compose down
```

## 4. 主なコマンド

| コマンド | 説明 |
| :--- | :--- |
| `npm run dev` | 開発サーバーの起動 |
| `npm run build` | 本番用ビルドの作成 |
| `npm run start` | ビルド済みアプリの起動 |
| `npm run lint` | コードの静的解析 (ESLint) |
| `npx prisma studio` | データベース管理GUIの起動 |

## 5. ディレクトリ構造

*   `src/app`: Next.js App Routerのページコンポーネント
*   `src/app/api`: APIルート (認証、メッセージ、SSE等)
*   `src/components`: 再利用可能なUIコンポーネント
*   `src/lib`: ユーティリティ関数、Prismaクライアント、SSE管理クラス
*   `prisma`: データベーススキーマ定義 (`schema.prisma`)
*   `docs`: ドキュメント類 (仕様書、計画書、本ガイド)

## 6. 開発フロー

1.  `main` ブランチから機能ごとのブランチを作成 (`feature/xxx`)
2.  実装とローカル検証
3.  プルリクエストの作成とレビュー
4.  マージ

---


## 7. 運用・トラブルシューティング

### データベースのリセット
データベースの内容を完全に消去し、初期状態に戻したい場合は以下のコマンドを実行します。
**注意**: 全てのデータが削除されます。

```bash
npx prisma migrate reset
```

---
不明点がある場合は、プロジェクト管理者にお問い合わせください。
