# Multi-Model Experiments

書籍『Agent SDKによるマルチモデル実装』のサポートコード。

## Quick Start

```bash
# 新しい実験を始める
cp -r experiments/bias-branch experiments/my-experiment
cd experiments/my-experiment
cp .env.example .env
# .env にAPIキーを設定
npm install && npm run build
npm start -- --dry-run
```

## Architecture

各実験はクリーンアーキテクチャで統一:

```
src/
  domain/           # 型定義・プロンプト (SDK非依存)
  application/      # ユースケース (実験ロジック)
  infrastructure/   # APIクライアント・設定・永続化
  interface/        # CLIエントリポイント
```

domain/ は外部SDKを import しない。
新モデルの追加は infrastructure/clients/ に1ファイル追加するだけ。

## 新しいモデルを追加する

1. `infrastructure/clients/` に新クライアントを作成:

```typescript
// infrastructure/clients/chatgpt.ts
import OpenAI from "openai";
export async function callChatGPT(prompt, config) {
  const client = new OpenAI({ apiKey: config.apiKey });
  // ...
}
```

2. `domain/types.ts` の `ModelProvider` に追加
3. `infrastructure/config.ts` にAPIキーとモデルIDを追加
4. テストを書く

## 新しい実験を作る

bias-branch をテンプレートとしてコピー:

```bash
cp -r experiments/bias-branch experiments/my-experiment
```

変更するファイル:
- `domain/types.ts` — 実験固有の型定義
- `domain/prompts.ts` — プロンプトセット
- `application/` — 実験ロジック
- `interface/cli.ts` — CLI引数

変更しないファイル (そのまま再利用):
- `infrastructure/clients/` — APIクライアント
- `infrastructure/clients/retry.ts` — リトライ
- `infrastructure/config.ts` — 設定読込

## Commands

```bash
npm test          # テスト実行
npm run build     # TypeScript コンパイル
npm start         # 実験実行
npm start -- --dry-run        # API呼出なしで確認
npm start -- --prompt eth-01  # 特定プロンプトのみ
npm start -- --model claude   # 特定モデルのみ
```

## API Keys

| 環境変数 | プロバイダ | 取得先 |
|---------|-----------|--------|
| ANTHROPIC_API_KEY | Claude | console.anthropic.com |
| GOOGLE_AI_API_KEY | Gemini | aistudio.google.com |
| XAI_API_KEY | Grok | console.x.ai |

## References

- 書籍: Agent SDKによるマルチモデル実装 (Pigeonworks Books)
- Agent SDK: https://docs.anthropic.com/
- MCP: https://modelcontextprotocol.io/
- xAI API: https://docs.x.ai/
