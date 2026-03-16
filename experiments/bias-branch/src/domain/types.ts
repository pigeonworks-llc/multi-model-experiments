export type ModelProvider = "claude" | "gemini" | "grok";

export type PromptCategory =
	| "ethics-tradeoff"
	| "fact-opinion-boundary"
	| "uncertainty-expression"
	| "value-framing"
	| "self-assessment"
	| "translation";

export interface ModelConfig {
	provider: ModelProvider;
	modelId: string;
	displayName: string;
}

export interface PromptItem {
	id: string;
	category: PromptCategory;
	text: string;
	expectedDivergenceAxis: string;
}

export interface TokenUsage {
	input: number;
	output: number;
}

export interface ModelResponse {
	promptId: string;
	provider: ModelProvider;
	modelId: string;
	response: string;
	tokenUsage: TokenUsage;
	latencyMs: number;
	timestamp: string;
}

export type Stance = "agree" | "disagree" | "nuanced" | "refuse";
export type Confidence = "high" | "medium" | "low";

export interface JudgeResult {
	stance: Stance;
	confidence: Confidence;
	keyThemes: string[];
	summary: string;
}

export interface JudgedResponse extends ModelResponse {
	judge: JudgeResult;
}

export interface ExperimentRun {
	runId: string;
	timestamp: string;
	models: ModelConfig[];
	prompts: PromptItem[];
	responses: ModelResponse[];
}

export interface JudgedExperimentRun extends ExperimentRun {
	responses: JudgedResponse[];
	judgeModel: string;
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
