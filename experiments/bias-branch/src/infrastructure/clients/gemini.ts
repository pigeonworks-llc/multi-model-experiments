import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ClientResult } from "../../domain/types.js";
import { withRetry } from "./retry.js";

export async function callGemini(
	prompt: string,
	config: { apiKey: string; model: string },
): Promise<ClientResult> {
	const genAI = new GoogleGenerativeAI(config.apiKey);
	const model = genAI.getGenerativeModel({ model: config.model });

	const start = Date.now();
	const result = await withRetry(
		() => model.generateContent(prompt),
		3,
		1000,
	);
	const latencyMs = Date.now() - start;

	const response = result.response;
	const usage = response.usageMetadata;

	return {
		response: response.text(),
		usage: {
			input: usage?.promptTokenCount ?? 0,
			output: usage?.candidatesTokenCount ?? 0,
		},
		latencyMs,
	};
}
