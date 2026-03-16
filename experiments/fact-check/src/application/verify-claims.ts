import { randomUUID } from "node:crypto";
import { buildVerificationPrompt } from "../domain/claims.js";
import type {
	Claim,
	ClientResult,
	Confidence,
	SearchSource,
	Verdict,
	VerificationResult,
	VerificationRun,
} from "../domain/types.js";

export interface VerifyOptions {
	claims: Claim[];
	callFn: (
		prompt: string,
		config: { apiKey: string; model: string },
	) => Promise<ClientResult>;
	apiKey: string;
	model: string;
	onProgress?: (message: string) => void;
}

interface ParsedVerdict {
	verdict: Verdict;
	confidence: Confidence;
	explanation: string;
	sources: SearchSource[];
}

function parseVerdict(raw: string): ParsedVerdict | null {
	try {
		const parsed = JSON.parse(raw);
		const validVerdicts: Verdict[] = [
			"true",
			"false",
			"partially-true",
			"unverifiable",
		];
		const validConfidence: Confidence[] = ["high", "medium", "low"];

		if (
			!validVerdicts.includes(parsed.verdict) ||
			!validConfidence.includes(parsed.confidence)
		) {
			return null;
		}

		return {
			verdict: parsed.verdict,
			confidence: parsed.confidence,
			explanation: parsed.explanation ?? "",
			sources: Array.isArray(parsed.sources) ? parsed.sources : [],
		};
	} catch {
		return null;
	}
}

export async function verifyClaims(
	options: VerifyOptions,
): Promise<VerificationRun> {
	const { claims, callFn, apiKey, model, onProgress } = options;
	const runId = randomUUID();
	const results: VerificationResult[] = [];
	const total = claims.length;

	for (let i = 0; i < claims.length; i++) {
		const claim = claims[i];
		const prompt = buildVerificationPrompt(claim.text);

		onProgress?.(`[${i + 1}/${total}] Verifying: ${claim.id}`);

		let result: VerificationResult;

		try {
			const clientResult = await callFn(prompt, { apiKey, model });
			const parsed = parseVerdict(clientResult.response);

			if (parsed) {
				result = {
					claimId: claim.id,
					verdict: parsed.verdict,
					confidence: parsed.confidence,
					explanation: parsed.explanation,
					sources: parsed.sources,
					tokenUsage: clientResult.usage,
					latencyMs: clientResult.latencyMs,
					timestamp: new Date().toISOString(),
				};
			} else {
				result = {
					claimId: claim.id,
					verdict: "unverifiable",
					confidence: "low",
					explanation: `Failed to parse model response: ${clientResult.response.slice(0, 200)}`,
					sources: [],
					tokenUsage: clientResult.usage,
					latencyMs: clientResult.latencyMs,
					timestamp: new Date().toISOString(),
				};
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			result = {
				claimId: claim.id,
				verdict: "unverifiable",
				confidence: "low",
				explanation: `Error during verification: ${message}`,
				sources: [],
				tokenUsage: { input: 0, output: 0 },
				latencyMs: 0,
				timestamp: new Date().toISOString(),
			};
			onProgress?.(`[ERROR] ${claim.id}: ${message.slice(0, 80)}`);
		}

		results.push(result);
	}

	return {
		runId,
		timestamp: new Date().toISOString(),
		model,
		claims,
		results,
	};
}
