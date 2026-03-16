// {{ experiment_name }} - Domain Types
// SDK非依存。ビジネスロジックの型定義のみ。

export type ModelProvider = "claude" | "gemini" | "grok";

export interface PromptItem {
	id: string;
	text: string;
	category: string;
}

export interface TokenUsage {
	input: number;
	output: number;
}

export interface ClientResult {
	response: string;
	usage: TokenUsage;
	latencyMs: number;
}

export type CallFn = (
	prompt: string,
	config: { apiKey: string; model: string },
) => Promise<ClientResult>;

export interface ModelResponse {
	promptId: string;
	provider: ModelProvider;
	modelId: string;
	response: string;
	tokenUsage: TokenUsage;
	latencyMs: number;
	timestamp: string;
}

export interface ExperimentRun {
	runId: string;
	timestamp: string;
	responses: ModelResponse[];
}
