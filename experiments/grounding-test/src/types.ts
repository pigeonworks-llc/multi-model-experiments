export type Condition = "gemini-grounded" | "gemini-plain" | "grok";
export type PromptType = "factual" | "analytical";

export interface PromptItem {
	id: string;
	type: PromptType;
	text: string;
	verificationMethod: string;
}

export interface ModelResponse {
	promptId: string;
	condition: Condition;
	model: string;
	response: string;
	groundingMetadata?: unknown;
	latencyMs: number;
	timestamp: string;
}

export interface ExperimentRun {
	runId: string;
	timestamp: string;
	conditions: Condition[];
	prompts: PromptItem[];
	responses: ModelResponse[];
}
