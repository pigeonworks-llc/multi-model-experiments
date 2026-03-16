import OpenAI from "openai";
import type { ClientResult } from "../../domain/types.js";
import { withRetry } from "./retry.js";

export async function callGrok(
	prompt: string,
	config: { apiKey: string; model: string },
): Promise<ClientResult> {
	const client = new OpenAI({
		apiKey: config.apiKey,
		baseURL: "https://api.x.ai/v1",
	});

	const start = Date.now();
	const completion = await withRetry(
		() =>
			client.chat.completions.create({
				model: config.model,
				messages: [{ role: "user", content: prompt }],
				max_tokens: 2048,
			}),
		3,
		1000,
	);
	const latencyMs = Date.now() - start;

	const content = completion.choices[0]?.message?.content ?? "";

	return {
		response: content,
		usage: {
			input: completion.usage?.prompt_tokens ?? 0,
			output: completion.usage?.completion_tokens ?? 0,
		},
		latencyMs,
	};
}
