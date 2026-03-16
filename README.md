# Agent SDKによるマルチモデル実装 — サポートコード

書籍『**Agent SDKによるマルチモデル実装 — バイアス分岐テストから判断フレームワークまで**』（池淵峻一著、Pigeonworks Books）のサポートコードリポジトリ。

## 実験一覧

| ディレクトリ | 書籍の章 | 内容 |
|-------------|---------|------|
| `experiments/bias-branch/` | Ch.5-6 | バイアス分岐テスト (Claude/Gemini/Grok) |
| `experiments/grounding-test/` | Ch.9 | Gemini grounding あり/なし比較 |
| `experiments/fact-check/` | Ch.9 | Grok API による自動ファクトチェック |
| `experiments/search-compare/` | Ch.9 | Grok vs Gemini 検索比較 |

## 必要な環境

- Node.js 20+
- TypeScript 5.7+
- npm

## セットアップ

### 1. API キーの取得

3社のAPIキーが必要です。

| プロバイダ | 取得先 | 環境変数 |
|-----------|--------|---------|
| Anthropic (Claude) | [console.anthropic.com](https://console.anthropic.com) | `ANTHROPIC_API_KEY` |
| Google (Gemini) | [aistudio.google.com](https://aistudio.google.com) | `GOOGLE_AI_API_KEY` |
| xAI (Grok) | [console.x.ai](https://console.x.ai) | `XAI_API_KEY` |

### 2. 環境変数の設定

各実験ディレクトリに `.env` ファイルを作成します。

```bash
cd experiments/bias-branch
cp .env.example .env
# .env に API キーを記入
```

### 3. 依存関係のインストール

```bash
cd experiments/bias-branch
npm install
```

### 4. ビルド

```bash
npm run build
```

## 実験の実行

### バイアス分岐テスト (bias-branch)

```bash
cd experiments/bias-branch

# プロンプトとモデルの確認 (API呼び出しなし)
npm start -- --dry-run

# 1問だけ試す
npm start -- --prompt eth-01

# フル実行 + Judge分類
npm start -- --judge
```

### Grok vs Gemini 検索比較 (search-compare)

```bash
cd experiments/search-compare

npm start -- --dry-run    # 確認
npm start                 # 全クエリ実行
```

### 自動ファクトチェック (fact-check)

```bash
cd experiments/fact-check

npm start -- --dry-run    # 確認
npm start                 # 全主張を検証
```

## テスト

各実験にユニットテストがあります。

```bash
cd experiments/bias-branch && npm test
cd experiments/grounding-test && npm test
cd experiments/fact-check && npm test
cd experiments/search-compare && npm test
```

## アーキテクチャ

各実験はクリーンアーキテクチャで構成されています。

```
src/
  domain/           # ビジネスロジック (SDK非依存)
  application/      # ユースケース
  infrastructure/   # 外部SDK依存
  interface/        # CLIエントリポイント
```

`domain/` は外部SDKを一切 import しません。

## コスト見積もり

| 実験 | API呼出回数 | dev推定コスト |
|------|-----------|-------------|
| bias-branch (--judge) | 144 | ~$0.60 |
| search-compare | 24 | ~$0.50 |
| fact-check | 12 | ~$0.10 |

## 注意事項

- LLMの出力には再現性がありません。同じコードを実行しても結果は毎回異なります
- 本書の実験データは2026年3月14-16日に取得したものです
- APIの仕様や価格は変更される可能性があります

## ライセンス

MIT License. 詳細は [LICENSE](LICENSE) を参照。
