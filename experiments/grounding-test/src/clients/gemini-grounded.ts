import { GoogleGenerativeAI } from "@google/generative-ai";
import { withRetry } from "./retry.js";

export interface GroundedResult {
	response: string;
	groundingMetadata?: unknown;
	latencyMs: number;
}

export async function callGeminiGrounded(
	prompt: string,
	config: { apiKey: string; model: string },
): Promise<GroundedResult> {
	const genAI = new GoogleGenerativeAI(config.apiKey);
	const model = genAI.getGenerativeModel({
		model: config.model,
		tools: [
			{
				googleSearchRetrieval: {
					dynamicRetrievalConfig: {
						mode: "MODE_DYNAMIC",
						dynamicThreshold: 0.3,
					},
				},
			} as unknown as import("@google/generative-ai").Tool,
		],
	});

	const start = Date.now();
	const result = await withRetry(() => model.generateContent(prompt), 3, 1000);
	const latencyMs = Date.now() - start;

	const response = result.response;
	const candidate = response.candidates?.[0];
	const groundingMetadata = candidate?.groundingMetadata;

	return {
		response: response.text(),
		groundingMetadata: groundingMetadata ?? undefined,
		latencyMs,
	};
}
