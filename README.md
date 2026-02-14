# Clinical Notes App

録音データを取り込み、医療学習内容とエンドユーザーの課題を整理するアプリケーション。

## 機能

- 録音データ（.mp3等）のアップロードと文字起こし（OpenAI Whisper API）
- 学んだことリスト・課題リストの自動抽出
- 課題に紐づく学術論文・エビデンスの検索（PubMed API）
- 医学用語の認識・修正候補の提示

## 技術スタック

- Next.js (App Router, TypeScript)
- Tailwind CSS
- SQLite (Prisma)
- OpenAI Whisper API / GPT
- PubMed E-utilities API

## 起動手順

```bash
cd (自身のローカルディレクトリ)/clinical-notes-app # ローカルにクローンしたディレクトリに移動
npm install # 依存パッケージをインストール
cp .env.local.example .env.local  # .env.local.exapmleを.evn.localにコピー
OPENAI_API_KEY="(取得したOpenAI APIキー)" # .env.localにAPIキーを設定
npx prisma db push # データベースを作成
npm run dev # アプリケーションを起動
http://localhost:3000 # ブラウザでアプリケーションを開く
```
