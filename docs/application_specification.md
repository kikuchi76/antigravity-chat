# Antigravity Chat アプリケーション仕様書

## 1. 概要
Antigravity Chatは、Next.jsとSSE (Server-Sent Events) を用いたリアルタイムWebチャットアプリケーションです。
ユーザー認証、チャットルーム管理、リアルタイムメッセージング機能を備え、モダンでレスポンシブなUIを提供します。

## 2. 機能一覧

### 2.1 ユーザー認証
- **サインアップ**: メールアドレス、ユーザー名、パスワードによる新規登録。
- **ログイン**: 登録済み認証情報によるログイン。
- **ログアウト**: セッションの終了。
- **セッション管理**: NextAuth.js (JWT) によるセッション維持。

### 2.2 チャット機能
- **ルーム管理**:
    - 新規チャットルームの作成。
    - 参加中のルーム一覧表示。
    - ルーム切り替え。
- **メッセージング**:
    - テキストメッセージの送信。
    - リアルタイム受信 (SSE)。
    - 送信時刻の表示。
    - 自分のメッセージ（右側）と他人のメッセージ（左側）の視覚的区別。
- **ユーザー招待**:
    - メールアドレスによるユーザー検索。
    - 既存ルームへのユーザー招待。

### 2.3 UI/UX
- **テーマ**: ダークモードベースのモダンデザイン。
- **レスポンシブ**: モバイル/デスクトップ対応（Tailwind CSS）。
- **フィードバック**: ローディング表示、楽観的UI更新による高速な操作感。

## 3. 技術スタック

### フロントエンド
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

### バックエンド
- **Runtime**: Next.js API Routes (Serverless Functions)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Server-Sent Events (SSE) - Native implementation
- **Auth**: NextAuth.js v5 (Beta)
- **Security**: bcryptjs (パスワードハッシュ化)

## 4. データモデル (ER図概要)

### User
- `id`: String (UUID)
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `image`: String?
- `createdAt`: DateTime

### Conversation
- `id`: String (UUID)
- `name`: String?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### ConversationMember
- `id`: String (UUID)
- `userId`: String (FK -> User)
- `conversationId`: String (FK -> Conversation)
- `joinedAt`: DateTime

### Message
- `id`: String (UUID)
- `content`: String
- `role`: String ('user' | 'ai')
- `createdAt`: DateTime
- `conversationId`: String (FK -> Conversation)
- `userId`: String? (FK -> User)

## 5. API仕様概要

### 認証
- `POST /api/auth/signup`: 新規ユーザー登録。

### チャットルーム
- `GET /api/conversations`: 参加中のルーム一覧取得。
- `POST /api/conversations`: 新規ルーム作成。
- `POST /api/conversations/[id]/members`: ルームへのメンバー追加（招待）。

### メッセージ
- `GET /api/messages?conversationId={id}`: 指定ルームのメッセージ一覧取得。
- `POST /api/messages`: メッセージ送信。
    - Body: `{ content, role, conversationId }`
    - 処理: DB保存後、SSEで全クライアントにブロードキャスト。

### リアルタイム (SSE)
- `GET /api/events`: SSE接続エンドポイント。
    - クライアントは `EventSource` で接続。
    - サーバーは `text/event-stream` でイベントをプッシュ。

### ユーザー検索
- `GET /api/users/search?email={email}`: メールアドレスによるユーザー検索。
