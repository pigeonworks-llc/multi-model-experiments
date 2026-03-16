import { randomUUID } from "node:crypto";
import { buildSearchPrompt } from "../domain/queries.js";
import type {
	ClientResult,
	ComparisonResult,
	ComparisonRun,
	QueryItem,
} from "../domain/types.js";

export interface CompareOptions {
	queries: QueryItem[];
	grokCallFn: (
		prompt: string,
		config: { apiKey: string; model: string },
	) => Promise<ClientResult>;
	geminiCallFn: (
		prompt: string,
		config: { apiKey: string; model: string },
	) => Promise<ClientResult>;
	grokApiKey: string;
	geminiApiKey: string;
	grokModel: string;
	geminiModel: string;
	onProgress?: (message: string) => void;
}

function errorResult(message: string): ClientResult {
	return {
		response: `ERROR: ${message}`,
		sources: [],
		usage: { input: 0, output: 0 },
		latencyMs: 0,
	};
}

export async function compareSearch(
	options: CompareOptions,
): Promise<ComparisonRun> {
	const {
		queries,
		grokCallFn,
		geminiCallFn,
		grokApiKey,
		geminiApiKey,
		grokModel,
		geminiModel,
		onProgress,
	} = options;

	const runId = randomUUID();
	const results: ComparisonResult[] = [];
	const total = queries.length;

	for (let i = 0; i < queries.length; i++) {
		const query = queries[i];
		const prompt = buildSearchPrompt(query.text);

		onProgress?.(`[${i + 1}/${total}] Comparing: ${query.id}`);

		let grokResult: ClientResult;
		try {
			grokResult = await grokCallFn(prompt, {
				apiKey: grokApiKey,
				model: grokModel,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			grokResult = errorResult(message);
			onProgress?.(`[ERROR] Grok x ${query.id}: ${message.slice(0, 80)}`);
		}

		let geminiResult: ClientResult;
		try {
			geminiResult = await geminiCallFn(prompt, {
				apiKey: geminiApiKey,
				model: geminiModel,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			geminiResult = errorResult(message);
			onProgress?.(
				`[ERROR] Gemini x ${query.id}: ${message.slice(0, 80)}`,
			);
		}

		results.push({
			queryId: query.id,
			grok: grokResult,
			gemini: geminiResult,
			timestamp: new Date().toISOString(),
		});
	}

	return {
		runId,
		timestamp: new Date().toISOString(),
		grokModel,
		geminiModel,
		queries,
		results,
	};
}
