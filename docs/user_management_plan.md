# ユーザー管理機能 実装計画

## 目標

複数のユーザーが利用できるチャットアプリケーションとするため、ユーザー認証とユーザー管理機能を追加します。

## 提案される変更

### 1. 認証システム (NextAuth.js)

**選定理由**: Next.jsとの統合が容易で、多様な認証プロバイダーをサポート。

#### インストール
```bash
npm install next-auth@beta
```

#### 設定ファイル
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth設定
- 認証プロバイダー: Credentials (メール/パスワード)、Google OAuth (オプション)

---

### 2. データベーススキーマ拡張

#### 新規テーブル: User

| カラム名 | データ型 | 制約 | 説明 |
|:---|:---|:---|:---|
| `id` | String (UUID) | PK | ユーザーID |
| `email` | String | UNIQUE, NOT NULL | メールアドレス |
| `name` | String | NOT NULL | 表示名 |
| `password` | String | NOT NULL | ハッシュ化されたパスワード |
| `avatar` | String | NULLABLE | アバター画像URL |
| `created_at` | DateTime | Default: now() | 作成日時 |
| `updated_at` | DateTime | Default: now() | 更新日時 |

#### 既存テーブルの変更

**Message テーブル**
- `userId` カラムを追加 (FK → User.id)
- メッセージの送信者を特定

**Conversation テーブル**
- `ownerId` カラムを追加 (FK → User.id)
- チャットルームの作成者を記録

#### 新規テーブル: ConversationMember

複数ユーザーが同じチャットルームに参加できるようにする中間テーブル。

| カラム名 | データ型 | 制約 | 説明 |
|:---|:---|:---|:---|
| `id` | String (UUID) | PK | ID |
| `conversationId` | String (UUID) | FK, Index | Conversation ID |
| `userId` | String (UUID) | FK, Index | User ID |
| `joinedAt` | DateTime | Default: now() | 参加日時 |

---

### 3. 認証フロー

#### サインアップ
1. `/signup` ページでメール、名前、パスワードを入力
2. パスワードをbcryptでハッシュ化
3. Userテーブルに保存
4. 自動的にログイン

#### ログイン
1. `/login` ページでメール、パスワードを入力
2. NextAuthのCredentialsプロバイダーで認証
3. セッション作成

#### セッション管理
- NextAuthのJWTセッション戦略を使用
- クライアント側で`useSession`フックを使用してユーザー情報を取得

---

### 4. UI変更

#### ログイン/サインアップページ
- `/login`: ログインフォーム
- `/signup`: サインアップフォーム
- プレミアムなデザインで統一

#### チャット画面
- サイドバーのユーザー情報を実際のログインユーザーに変更
- メッセージにユーザー名とアバターを表示
- ログアウトボタンを追加

#### チャットルーム管理
- 新規チャットルーム作成機能
- ユーザーを招待する機能（将来的な拡張）

---

### 5. API変更

#### 新規エンドポイント
- `POST /api/auth/signup`: ユーザー登録
- `GET /api/users/me`: 現在のユーザー情報取得
- `GET /api/conversations`: ユーザーが参加しているチャットルーム一覧
- `POST /api/conversations`: 新規チャットルーム作成

#### 既存エンドポイントの変更
- `POST /api/messages`: `userId`を自動的に設定（セッションから取得）
- `GET /api/messages`: 特定のconversationIdのメッセージのみ取得

---

### 6. セキュリティ

- パスワードは`bcrypt`でハッシュ化
- APIルートはミドルウェアで認証チェック
- CSRF保護（NextAuthが自動的に処理）
- 環境変数で`NEXTAUTH_SECRET`を設定

---

## 検証計画

### 自動テスト
- ビルドが成功することを確認
- 開発サーバーが起動することを確認

### 手動検証
1. サインアップ → ログイン → チャット送信の一連の流れを確認
2. 複数ユーザーでログインし、同じチャットルームでメッセージを送受信
3. ログアウト → 再ログインでセッションが保持されることを確認
4. 異なるユーザーのメッセージが区別されて表示されることを確認

---

## 実装の優先順位

1. **Phase 1**: 基本認証（サインアップ/ログイン）
2. **Phase 2**: ユーザー情報の表示とメッセージへの紐付け
3. **Phase 3**: チャットルーム管理と複数ユーザー対応
