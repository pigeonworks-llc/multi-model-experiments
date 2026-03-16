import type { PromptItem } from "./types.js";

export const PROMPTS: PromptItem[] = [
	// --- factual (5) ---
	{
		id: "fact-01",
		type: "factual",
		text: "Zenn Booksでの書籍販売における手数料率（プラットフォーム側の取り分）は何%ですか？公式の情報に基づいて回答してください。",
		verificationMethod: "Zenn公式ヘルプページで手数料率を確認",
	},
	{
		id: "fact-02",
		type: "factual",
		text: "2024年に公開されたCVE（Common Vulnerabilities and Exposures）の総件数を教えてください。",
		verificationMethod: "NIST NVD統計ページで年別CVE件数を確認",
	},
	{
		id: "fact-03",
		type: "factual",
		text: "Anthropic Claude Sonnet 4の入力トークンあたりのAPI単価（USD/1M tokens）を教えてください。",
		verificationMethod: "Anthropic公式料金ページで価格を確認",
	},
	{
		id: "fact-04",
		type: "factual",
		text: "Node.js 22のLTSサポート終了予定日はいつですか？",
		verificationMethod: "Node.js公式リリーススケジュールで確認",
	},
	{
		id: "fact-05",
		type: "factual",
		text: "Rust 1.80で安定化された主要な機能を3つ挙げてください。",
		verificationMethod: "Rust 1.80リリースノートで安定化機能を確認",
	},

	// --- analytical (5) ---
	{
		id: "anl-01",
		type: "analytical",
		text: "2026年時点で日本語の技術書執筆に最も広く採用されている組版ツールは何ですか？根拠とともに回答してください。",
		verificationMethod: "技術書典・技書博の利用ツール調査、出版社ヒアリング",
	},
	{
		id: "anl-02",
		type: "analytical",
		text: "RAGを適用したLLMのハルシネーション率は平均何%程度ですか？信頼できるベンチマークデータに基づいて回答してください。",
		verificationMethod:
			"RAGASベンチマーク、学術論文のハルシネーション率測定結果",
	},
	{
		id: "anl-03",
		type: "analytical",
		text: "マルチエージェントシステムにおいて、モデル数を増やすことの収穫逓減点は一般的に何モデル目あたりで観測されますか？",
		verificationMethod: "マルチエージェント研究論文のスケーリング実験結果",
	},
	{
		id: "anl-04",
		type: "analytical",
		text: "LLMを使ったOSINT（公開情報調査）の最大のリスクは何ですか？",
		verificationMethod:
			"OSINT関連のセキュリティ研究、MITRE ATT&CKフレームワーク",
	},
	{
		id: "anl-05",
		type: "analytical",
		text: "プロンプトインジェクション攻撃の防御において、最も効果的とされるアプローチは何ですか？",
		verificationMethod:
			"OWASP LLM Top 10、プロンプトインジェクション防御の学術論文",
	},
];
