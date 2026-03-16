import Anthropic from "@anthropic-ai/sdk";
import type { ClientResult } from "../../domain/types.js";
import { withRetry } from "./retry.js";

export async function callClaude(
	prompt: string,
	config: { apiKey: string; model: string },
): Promise<ClientResult> {
	const client = new Anthropic({ apiKey: config.apiKey });

	const start = Date.now();
	const message = await withRetry(
		() =>
			client.messages.create({
				model: config.model,
				max_tokens: 2048,
				messages: [{ role: "user", content: prompt }],
			}),
		3,
		1000,
	);
	const latencyMs = Date.now() - start;

	const text = message.content
		.filter((block): block is Anthropic.TextBlock => block.type === "text")
		.map((block) => block.text)
		.join("");

	return {
		response: text,
		usage: {
			input: message.usage.input_tokens,
			output: message.usage.output_tokens,
		},
		latencyMs,
	};
}
