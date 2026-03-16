export type Verdict = "true" | "false" | "partially-true" | "unverifiable";

export type Confidence = "high" | "medium" | "low";

export type ClaimCategory =
	| "historical"
	| "scientific"
	| "statistical"
	| "current-event"
	| "technical";

export interface Claim {
	id: string;
	category: ClaimCategory;
	text: string;
	expectedVerdict: Verdict;
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

export interface VerificationResult {
	claimId: string;
	verdict: Verdict;
	confidence: Confidence;
	explanation: string;
	sources: SearchSource[];
	tokenUsage: TokenUsage;
	latencyMs: number;
	timestamp: string;
}

export interface VerificationRun {
	runId: string;
	timestamp: string;
	model: string;
	claims: Claim[];
	results: VerificationResult[];
}

export interface ClientResult {
	response: string;
	sources: SearchSource[];
	usage: TokenUsage;
	latencyMs: number;
}
