import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "./retry.js";

export interface PlainResult {
	response: string;
	groundingMetadata?: undefined;
	latencyMs: number;
}

export async function callGeminiPlain(
	prompt: string,
	config: { apiKey: string; model: string },
): Promise<PlainResult> {
	const genAI = new GoogleGenerativeAI(config.apiKey);
	const model = genAI.getGenerativeModel({ model: config.model });

	const start = Date.now();
	const result = await withRetry(() => model.generateContent(prompt), 3, 1000);
	const latencyMs = Date.now() - start;

	return {
		response: result.response.text(),
		latencyMs,
	};
}
