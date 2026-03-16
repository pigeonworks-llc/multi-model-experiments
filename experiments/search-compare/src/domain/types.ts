export type SearchProvider = "grok" | "gemini";

export type Confidence = "high" | "medium" | "low";

export type QueryCategory =
	| "factual"
	| "recent-event"
	| "technical"
	| "statistical"
	| "controversial";

export interface QueryItem {
	id: string;
	category: QueryCategory;
	text: string;
}

export interface SearchSource {
	title: string;
	url: string;
	snippet: string;
}

export interface TokenUsage {
	input: number;
	output: number;
}

export interface ClientResult {
	response: string;
	sources: SearchSource[];
	usage: TokenUsage;
	latencyMs: number;
}

export interface ComparisonResult {
	queryId: string;
	grok: ClientResult;
	gemini: ClientResult;
	timestamp: string;
}

export interface ComparisonRun {
	runId: string;
	timestamp: string;
	grokModel: string;
	geminiModel: string;
	queries: QueryItem[];
	results: ComparisonResult[];
}
