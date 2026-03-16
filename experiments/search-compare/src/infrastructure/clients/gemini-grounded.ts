import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ClientResult, SearchSource } from "../../domain/types.js";
import { withRetry } from "./retry.js";

export async function callGeminiGrounded(
	prompt: string,
	config: { apiKey: string; model: string },
): Promise<ClientResult> {
	const genAI = new GoogleGenerativeAI(config.apiKey);
	const model = genAI.getGenerativeModel({
		model: config.model,
		tools: [
			{
				googleSearch: {},
			} as unknown as import("@google/generative-ai").Tool,
		],
	});

	const start = Date.now();
	const result = await withRetry(
		() => model.generateContent(prompt),
		3,
		1000,
	);
	const latencyMs = Date.now() - start;

	const response = result.response;
	const candidate = response.candidates?.[0];
	const groundingMetadata = candidate?.groundingMetadata;
	const sources: SearchSource[] = [];

	// Extract grounding sources if available
	if (groundingMetadata) {
		const chunks =
			(groundingMetadata as { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> })
				.groundingChunks ?? [];
		for (const chunk of chunks) {
			if (chunk.web) {
				sources.push({
					title: chunk.web.title ?? "",
					url: chunk.web.uri ?? "",
					snippet: "",
				});
			}
		}
	}

	return {
		response: response.text(),
		sources,
		usage: {
			input: 0,
			output: 0,
		},
		latencyMs,
	};
}
