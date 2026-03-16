# Agent SDKによるマルチモデル実装 — サポートコード

書籍『**Agent SDKによるマルチモデル実装 — バイアス分岐テストから判断フレームワークまで**』（池淵峻一著、Pigeonworks Books）のサポートコードリポジトリ。

## サポート環境

| 項目 | 要件 |
|------|------|
| OS | macOS, Linux, Windows (WSL2推奨) |
| Node.js | 20.0.0 以上 (LTS推奨) |
| npm | 10 以上 (Node.js 20に付属) |
| TypeScript | 5.7 以上 (devDependenciesに含まれる) |
| Git | 2.30 以上 |
| エディタ | 任意 (VS Code + TypeScript拡張を推奨) |

動作確認済み環境: macOS 14+ / Node.js 24.13.0 / npm 11.x

## 環境構築手順

### 1. Node.js のインストール

Node.js 20 以上が必要です。

```bash
# バージョン確認
node -v   # v20.0.0 以上であること
npm -v    # 10 以上であること
```

未インストールの場合:

- **macOS**: `brew install node` または [nodejs.org](https://nodejs.org/) からダウンロード
- **Linux**: `nvm install 20` ([nvm](https://github.com/nvm-sh/nvm) 推奨)
- **Windows**: WSL2 上で Linux と同じ手順、または [nodejs.org](https://nodejs.org/) からダウンロード

### 2. リポジトリのクローン

```bash
git clone https://github.com/pigeonworks-llc/multi-model-experiments.git
cd multi-model-experiments
```

### 3. API キーの取得

3社のAPIキーが必要です。全て無料枠または低コストで取得できます。

| プロバイダ | 取得先 | 環境変数 | 備考 |
|-----------|--------|---------|------|
| Anthropic (Claude) | [console.anthropic.com](https://console.anthropic.com) | `ANTHROPIC_API_KEY` | 従量課金。クレジットカード要 |
| Google (Gemini) | [aistudio.google.com](https://aistudio.google.com) | `GOOGLE_AI_API_KEY` | 無料枠あり。billing設定推奨 |
| xAI (Grok) | [console.x.ai](https://console.x.ai) | `XAI_API_KEY` | 従量課金。クレジットカード要 |

### 4. 環境変数の設定

各実験ディレクトリに `.env` ファイルを作成します。

```bash
cd experiments/bias-branch
cp .env.example .env
```

`.env` を編集してAPIキーを記入:

```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AI...
XAI_API_KEY=xai-...
```

他の実験ディレクトリでも同じ `.env` をコピーできます:

```bash
cp experiments/bias-branch/.env experiments/grounding-test/.env
cp experiments/bias-branch/.env experiments/fact-check/.env
cp experiments/bias-branch/.env experiments/search-compare/.env
```

### 5. 依存関係のインストールとビルド

```bash
cd experiments/bias-branch
npm install
npm run build
```

### 6. 動作確認

```bash
# API呼び出しなしでプロンプトとモデルの一覧を表示
npm start -- --dry-run
```

以下のような出力が表示されれば成功です:

```
Running 24 prompts x 3 models (dry run)
  Claude Haiku 4.5 x eth-01: Should AI systems explain...
  Gemini 2.5 Flash x eth-01: Should AI systems explain...
  Grok 3 Mini x eth-01: Should AI systems explain...
  ...
```

## 実験一覧

| ディレクトリ | 書籍の章 | 内容 |
|-------------|---------|------|
| `experiments/bias-branch/` | Ch.5-6 | バイアス分岐テスト (Claude/Gemini/Grok) |
| `experiments/grounding-test/` | Ch.9 | Gemini grounding あり/なし比較 |
| `experiments/fact-check/` | Ch.9 | Grok API による自動ファクトチェック |
| `experiments/search-compare/` | Ch.9 | Grok vs Gemini 検索比較 |

## 実験の実行

### バイアス分岐テスト (bias-branch)

書籍の中核実験。3社モデルに同一プロンプト24問を投げ、応答の独立性を定量評価します。

```bash
cd experiments/bias-branch

npm start -- --dry-run          # 確認 (API呼出なし)
npm start -- --prompt eth-01    # 1問だけ試す
npm start                       # フル実行 (raw JSON保存)
npm start -- --judge            # フル実行 + Judge分類
```

結果は `results/` に JSON で保存されます。

### Grok vs Gemini 検索比較 (search-compare)

同一クエリを Grok (web_search) と Gemini (google_search grounding) に投げ、応答とレイテンシーを比較します。

```bash
cd experiments/search-compare

npm start -- --dry-run    # 確認
npm start                 # 全クエリ実行
```

### 自動ファクトチェック (fact-check)

Grok API の web_search を使い、主張を自動検証します。

```bash
cd experiments/fact-check

npm start -- --dry-run    # 確認
npm start                 # 全主張を検証
```

### Gemini grounding 比較 (grounding-test)

Gemini の Google Search grounding あり/なしで応答を比較します。

```bash
cd experiments/grounding-test

npm start -- --dry-run    # 確認
npm start                 # 全条件実行
```

## テスト

各実験にユニットテストがあります。API呼び出しはモックされるため、APIキーなしで実行可能です。

```bash
# 個別に実行
cd experiments/bias-branch && npm test

# 全実験を一括テスト
for d in experiments/*/; do (cd "$d" && npm test); done
```

## 自分の実験を作る

copier テンプレートを使って新しい実験のスケルトンを生成できます。

```bash
# copier のインストール (未インストールの場合)
pip install copier

# テンプレートから新実験を生成
copier copy gh:pigeonworks-llc/multi-model-experiments my-experiment
```

対話的に実験名やモデル構成を選択すると、クリーンアーキテクチャのスケルトンが生成されます。`src/domain/prompts.ts` を書き換えるだけで実験を開始できます。

詳細は [CLAUDE.md](CLAUDE.md) を参照してください。

## アーキテクチャ

各実験はクリーンアーキテクチャで構成されています。

```
src/
  domain/           # 型定義・プロンプト (SDK非依存)
  application/      # ユースケース (実験ロジック)
  infrastructure/   # APIクライアント・設定・永続化
  interface/        # CLIエントリポイント
```

- `domain/` は外部SDKを一切 import しない
- 新モデルの追加は `infrastructure/clients/` に1ファイル追加するだけ

## コスト見積もり

| 実験 | API呼出回数 | 推定コスト |
|------|-----------|-----------|
| bias-branch (--judge) | 144 | ~$0.60 |
| search-compare | 24 | ~$0.50 |
| fact-check | 12 | ~$0.10 |
| grounding-test | 30 | ~$0.05 |

## トラブルシューティング

### Gemini のクォータエラー (429)

無料枠のクォータを超過した場合に発生します。[AI Studio](https://aistudio.google.com) で billing を有効にしてください。

### Grok の web_search エラー

`web_search` ツールは `grok-4` 系モデルでのみ対応しています。`grok-3` や `grok-3-mini` では使用できません。

### TypeScript のビルドエラー

Node.js のバージョンが古い場合に発生することがあります。`node -v` で 20 以上であることを確認してください。

### .env が読み込まれない

実験ディレクトリのルート（`package.json` と同じ階層）に `.env` ファイルがあることを確認してください。

## 注意事項

- LLMの出力には再現性がありません。同じコードを実行しても結果は毎回異なります
- 本書の実験データは2026年3月14-16日に取得したものです
- APIの仕様・価格・モデル名は変更される可能性があります

## ライセンス

MIT License. 詳細は [LICENSE](LICENSE) を参照。
