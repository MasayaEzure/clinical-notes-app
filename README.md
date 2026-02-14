# Clinical Notes App

録音データを取り込み、医療学習内容とエンドユーザーの課題を整理するアプリケーション。

## 機能

- 録音データ（.mp3等）のアップロードと文字起こし（OpenAI Whisper API）
- 学んだことリスト・課題リストの自動抽出（GPT-4o-mini）
- 課題に紐づく学術論文・エビデンスの検索（PubMed API）
- 医学用語の認識・修正候補の提示

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.1.6 | フレームワーク（App Router, TypeScript） |
| React | 19.2.3 | UIライブラリ |
| Tailwind CSS | v4 | スタイリング |
| Prisma | v6 | ORM（SQLite） |
| OpenAI API | - | Whisper（文字起こし）/ GPT-4o-mini（分析） |
| PubMed E-utilities | - | 学術論文検索 |

## 起動手順

```bash
cd (自身のローカルディレクトリ)/clinical-notes-app # ローカルにクローンしたディレクトリに移動
npm install                                        # 依存パッケージをインストール
cp .env.local.example .env.local                   # .env.local.exampleを.env.localにコピー
# .env.local を編集して OPENAI_API_KEY を設定
npx prisma db push                                 # データベースを作成
npm run dev                                        # アプリケーションを起動（http://localhost:3000）
```

## 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | Yes | SQLiteデータベースのパス（デフォルト: `file:./dev.db`） |
| `OPENAI_API_KEY` | Yes | OpenAI APIキー（Whisper・GPT利用に必要） |

---

## ディレクトリ構成

```
clinical-notes-app/
├── prisma/
│   └── schema.prisma                              # データモデル定義
├── public/
│   └── uploads/                                   # アップロード音声ファイル保存先
├── src/
│   ├── app/
│   │   ├── layout.tsx                             # 共通レイアウト
│   │   ├── page.tsx                               # ダッシュボード（セッション一覧）
│   │   ├── sessions/
│   │   │   ├── new/
│   │   │   │   └── page.tsx                       # 新規セッション作成
│   │   │   └── [id]/
│   │   │       ├── page.tsx                       # セッション詳細
│   │   │       └── challenges/
│   │   │           └── [challengeId]/
│   │   │               └── page.tsx               # 課題エビデンスページ
│   │   └── api/
│   │       ├── transcribe/
│   │       │   └── route.ts                       # 音声→文字起こし
│   │       ├── analyze/
│   │       │   └── route.ts                       # GPT分析（学習/課題/医学用語抽出）
│   │       ├── sessions/
│   │       │   ├── route.ts                       # セッション一覧・作成
│   │       │   └── [id]/
│   │       │       └── route.ts                   # **セッション詳細取得**
│   │       ├── challenges/
│   │       │   └── route.ts                       # 課題追加
│   │       └── pubmed/
│   │           └── search/
│   │               └── route.ts                   # PubMed論文検索
│   ├── components/
│   │   ├── ui/                                    # 汎用UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   └── Header.tsx                         # ヘッダーナビゲーション
│   │   ├── AudioUploader.tsx                      # 音声ファイルアップロードUI
│   │   ├── LearningsList.tsx                      # 学んだことリスト表示
│   │   ├── ChallengesList.tsx                     # 課題リスト表示（リンク付き）
│   │   ├── MedicalTermCorrection.tsx              # 医学用語修正候補UI
│   │   └── PubMedResults.tsx                      # PubMed論文一覧表示
│   └── lib/
│       ├── prisma.ts                              # Prismaクライアント（シングルトン）
│       ├── openai.ts                              # OpenAIクライアント（シングルトン）
│       ├── pubmed.ts                              # PubMed APIヘルパー
│       ├── prompts.ts                             # GPTプロンプトテンプレート
│       └── types.ts                               # 型定義
├── .env.local.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## ページ構成

| パス | 説明 | 主要機能 |
|------|------|----------|
| `/` | ダッシュボード | セッション一覧をカード形式で表示。各カードに学び・課題の件数を表示 |
| `/sessions/new` | 新規セッション作成 | 音声アップロード → 文字起こし → GPT分析 → 保存のマルチステップフロー |
| `/sessions/[id]` | セッション詳細 | 文字起こし全文、学んだことリスト、課題リスト（リンク付き）、医学用語修正履歴 |
| `/sessions/[id]/challenges/[challengeId]` | 課題エビデンス | 課題に関連するPubMed論文一覧（タイトル・著者・アブストラクト・DOIリンク） |

---

## APIエンドポイント

### 一覧

| メソッド | パス | 説明 |
|----------|------|------|
| `POST` | `/api/transcribe` | 音声ファイルをWhisper APIで文字起こし |
| `POST` | `/api/analyze` | 文字起こしテキストをGPTで分析 |
| `GET` | `/api/sessions` | セッション一覧取得 |
| `POST` | `/api/sessions` | セッション新規作成 |
| `GET` | `/api/sessions/[id]` | セッション詳細取得 |
| `POST` | `/api/challenges` | 課題追加 |
| `GET` | `/api/pubmed/search` | PubMed論文検索 |

### 詳細

#### `POST /api/transcribe`

**音声ファイルをアップロードし**、OpenAI Whisper APIで日本語の文字起こしを行う。

- **Content-Type**: `multipart/form-data`
- **リクエスト**: `audio` フィールドに音声ファイル（MP3, MP4, M4A, WAV, WebM / 最大25MB）
- **レスポンス**:
  ```json
  {
    "transcription": "文字起こしされたテキスト",
    "audioPath": "/uploads/1234567890-filename.mp3"
  }
  ```
- **エラー**: `400`（ファイルなし）, `413`（25MB超過）, `500`（文字起こし失敗）

#### `POST /api/analyze`

文字起こしテキストをGPT-4o-miniに送り、学んだこと・課題・医学用語修正候補を構造化データとして抽出する。

- **リクエスト**:
  ```json
  { "transcription": "文字起こしテキスト" }
  ```
- **レスポンス**:
  ```json
  {
    "learnings": ["学んだこと1", "学んだこと2"],
    "challenges": ["課題1", "課題2"],
    "medicalTerms": [
      {
        "original": "誤認識された単語",
        "candidates": ["正しい候補1", "正しい候補2", "正しい候補3"]
      }
    ]
  }
  ```
- **エラー**: `400`（テキストなし/無効）, `500`（分析失敗）

#### `GET /api/sessions`

保存済みセッションの一覧を取得する（作成日時の降順）。

- **レスポンス**: セッション配列（各セッションに学び・課題の件数を含む）
  ```json
  [
    {
      "id": 1,
      "title": "セッションタイトル",
      "transcription": "...",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "_count": { "learnings": 3, "challenges": 2 }
    }
  ]
  ```

#### `POST /api/sessions`

分析結果をもとにセッションを新規作成する。関連する学び・課題・医学用語を一括で保存する。

- **リクエスト**:
  ```json
  {
    "title": "セッションタイトル",
    "audioPath": "/uploads/...",
    "transcription": "文字起こしテキスト",
    "learnings": ["学び1", "学び2"],
    "challenges": ["課題1", "課題2"],
    "medicalTerms": [
      {
        "original": "元の単語",
        "candidates": ["候補1", "候補2"],
        "resolved": true,
        "resolvedTerm": "確定した用語"
      }
    ]
  }
  ```
- **レスポンス**: `201` 作成されたセッション（関連データ含む）
- **エラー**: `400`（title/transcription未指定）, `500`（作成失敗）

#### `GET /api/sessions/[id]`

特定のセッションの詳細情報を取得する（学び・課題・医学用語を含む）。

- **パスパラメータ**: `id`（セッションID）
- **レスポンス**:
  ```json
  {
    "id": 1,
    "title": "...",
    "audioPath": "...",
    "transcription": "...",
    "learnings": [{ "id": 1, "content": "..." }],
    "challenges": [{ "id": 1, "content": "..." }],
    "medicalTerms": [
      {
        "id": 1,
        "original": "...",
        "resolved": true,
        "resolvedTerm": "...",
        "candidates": [{ "id": 1, "term": "..." }]
      }
    ]
  }
  ```
- **エラー**: `400`（無効なID）, `404`（未検出）, `500`（取得失敗）

#### `POST /api/challenges`

既存セッションに課題を追加する（医学用語の修正結果からの追加に使用）。

- **リクエスト**:
  ```json
  { "sessionId": 1, "content": "課題の内容" }
  ```
- **レスポンス**: `201` 作成された課題オブジェクト
- **エラー**: `400`（sessionId/content未指定）, `500`（追加失敗）

#### `GET /api/pubmed/search`

PubMed E-utilities APIで学術論文を検索する。

- **クエリパラメータ**: `query`（検索キーワード）
- **レスポンス**:
  ```json
  {
    "papers": [
      {
        "pmid": "12345678",
        "title": "論文タイトル",
        "authors": ["Author1", "Author2"],
        "abstract": "論文の要旨...",
        "publishedDate": "2024-Jan-15",
        "doi": "10.xxxx/xxxxx"
      }
    ]
  }
  ```
- **最大取得件数**: 10件
- **エラー**: `400`（クエリなし）, `500`（検索失敗）

---

## データモデル

```
Session ──┬── Learning（1:N）
          ├── Challenge（1:N）
          └── MedicalTerm（1:N）── MedicalTermCandidate（1:N）
```

### Session（セッション）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | Int (PK) | 自動採番 |
| title | String | セッションタイトル |
| audioPath | String | アップロード音声ファイルパス |
| transcription | String | 文字起こしテキスト |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

### Learning（学んだこと）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | Int (PK) | 自動採番 |
| content | String | 学習内容 |
| sessionId | Int (FK) | セッションID（Cascade削除） |

### Challenge（課題）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | Int (PK) | 自動採番 |
| content | String | 課題内容 |
| sessionId | Int (FK) | セッションID（Cascade削除） |

### MedicalTerm（医学用語）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | Int (PK) | 自動採番 |
| original | String | 文字起こしされた元の単語 |
| resolved | Boolean | 修正済みフラグ（デフォルト: false） |
| resolvedTerm | String? | 確定した正しい用語 |
| sessionId | Int (FK) | セッションID（Cascade削除） |

### MedicalTermCandidate（修正候補）

| カラム | 型 | 説明 |
|--------|-----|------|
| id | Int (PK) | 自動採番 |
| term | String | 候補となる用語 |
| medicalTermId | Int (FK) | 医学用語ID（Cascade削除） |

---

## 主要コンポーネント

| コンポーネント | ファイル | 説明 |
|----------------|---------|------|
| AudioUploader | `src/components/AudioUploader.tsx` | ドラッグ&ドロップ対応の音声ファイルアップロード。ファイルサイズ（25MB上限）を検証 |
| MedicalTermCorrection | `src/components/MedicalTermCorrection.tsx` | 医学用語の修正候補をChipで表示。クリックで課題リストに追加。「その他」でモーダルによる手動入力 |
| LearningsList | `src/components/LearningsList.tsx` | GPTが抽出した「学んだこと」をリスト表示 |
| ChallengesList | `src/components/ChallengesList.tsx` | 課題リストを表示。各課題はエビデンスページへのリンク付き |
| PubMedResults | `src/components/PubMedResults.tsx` | PubMed論文をカード形式で表示（タイトル・著者・アブストラクト・PubMed/DOIリンク） |
| Header | `src/components/layout/Header.tsx` | ヘッダーナビゲーション（ホームリンク・新規セッションボタン） |
