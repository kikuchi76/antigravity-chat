# 実装計画 - Antigravity Chat

## 目標の説明
`antigravity-chat`という新しいWebアプリケーションを作成します。このアプリケーションはReact (Next.js) とTypeScriptを使用して構築されたチャットインターフェースになります。
ユーザーの要望により、スタイリングにはTailwind CSSを使用します。

## 提案される変更

### プロジェクトの初期化
- `c:\work\develop\GitHub\antigravity` に新しいディレクトリ `antigravity-chat` を作成します。
- `create-next-app` を使用してNext.jsアプリケーションを初期化します。
    - 設定: TypeScript, ESLint, Tailwind CSSあり, `src/` ディレクトリ, App Router。

### コアコンポーネント
#### [NEW] `antigravity-chat/`
- 標準的なNext.jsプロジェクト構造。
- `src/app/page.tsx`: メインのチャットインターフェース。
- `src/app/globals.css`: Tailwindディレクティブを含むグローバルスタイル。

### UIデザイン
- モダンで高級感のあるチャットレイアウトを実装します。
- ユーザー/ルーム用のサイドバー（折りたたみ可能）。
- メッセージ履歴のあるメインチャットエリア。
- 送信ボタンのある入力エリア。
- ダーク/モダンなカラーパレット（深い青、グレー、鮮やかなアクセントなど）を使用します。

### チャット機能ロジック
- `useState` を使用してメッセージリストと入力値を管理します。
- メッセージ送信機能（入力欄のクリア、リストへの追加）を実装します。
- `Enter` キーでの送信をサポートします。
- メッセージ送信時の自動スクロール機能を実装します。

### データベースとバックエンド
- **Docker環境**:
    - `docker-compose.yml` を作成し、PostgreSQLコンテナを定義します。
    - データの永続化のためにボリュームをマウントします。
- **ORM (Prisma)**:
    - `prisma` をセットアップし、PostgreSQLに接続します。
    - `Message` モデルを定義します（id, content, role, createdAt）。
    - マイグレーションを実行してデータベーススキーマを作成します。
- **APIルート**:
    - `src/app/api/messages/route.ts` を作成します。
    - `GET`: 全メッセージの取得。
    - `POST`: 新しいメッセージの保存。

### フロントエンド統合
- `useEffect` を使用して初期ロード時にAPIからメッセージを取得します。
- メッセージ送信時にAPIを呼び出し、データベースに保存します。

## 検証計画

### 自動テスト
- `npm run build` を実行してプロジェクトが正常にビルドされることを確認します。
- `npm run dev` を実行してサーバーがエラーなく起動することを確認します。
- `browser_subagent` を使用してローカルサーバーにアクセスし、ページが読み込まれ、要素が表示されることを確認します。

### 手動検証
- ユーザーがブラウザでアプリケーションを開けること。
- レイアウトが正しく、レスポンシブであることを確認します。

### リアルタイム機能 (Pusher)
- **技術選定**: Pusher (Channels)
    - 理由: サーバーレス環境（Vercel等）でも動作し、実装が容易で信頼性が高いため。
- **必要なパッケージ**:
    - `pusher`: サーバーサイド用
    - `pusher-js`: クライアントサイド用
- **環境変数**:
    - `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- **バックエンド実装**:
    - `src/lib/pusher.ts`: Pusherインスタンスの初期化。
    - `POST /api/messages`: メッセージ保存後に `pusher.trigger` を呼び出し、イベントを発火。
- **フロントエンド実装**:
    - `src/app/page.tsx`: `useEffect` で Pusher チャンネルを購読 (`subscribe`)。
    - イベント受信時にメッセージリストを更新。
    - 重複表示防止のロジック実装。
