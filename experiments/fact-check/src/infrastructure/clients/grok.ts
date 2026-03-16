import OpenAI from "openai";
import type { ClientResult, SearchSource } from "../../domain/types.js";
import { withRetry } from "./retry.js";

interface ResponseOutput {
	type: string;
	content?: Array<{ type: string; text?: string }>;
	// biome-ignore lint/suspicious/noExplicitAny: API response shape varies
	[key: string]: any;
}

export async function callGrokSearch(
	prompt: string,
	config: { apiKey: string; model: string },
): Promise<ClientResult> {
	const client = new OpenAI({
		apiKey: config.apiKey,
		baseURL: "https://api.x.ai/v1",
	});

	const start = Date.now();
	const response = await withRetry(
		() =>
			client.responses.create({
				model: config.model,
				// xAI uses "web_search" (not OpenAI's "web_search_preview")
				tools: [{ type: "web_search" }] as unknown as OpenAI.Responses.Tool[],
				input: prompt,
			}),
		3,
		1000,
	);
	const latencyMs = Date.now() - start;

	const output = (response as { output?: ResponseOutput[] }).output ?? [];
	let text = "";
	const sources: SearchSource[] = [];

	for (const item of output) {
		if (item.type === "message" && item.content) {
			for (const block of item.content) {
				if (block.type === "output_text" && block.text) {
					text += block.text;
				}
			}
		}
	}

	const usage = (response as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;

	return {
		response: text,
		sources,
		usage: {
			input: usage?.input_tokens ?? 0,
			output: usage?.output_tokens ?? 0,
		},
		latencyMs,
	};
}
