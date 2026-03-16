import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreate = vi.fn();

vi.mock("openai", () => ({
	default: vi.fn().mockImplementation(() => ({
		chat: {
			completions: { create: mockCreate },
		},
	})),
}));

import { callGrok } from "./grok.js";

describe("callGrok", () => {
	beforeEach(() => {
		mockCreate.mockReset();
	});

	it("returns response with usage and latency", async () => {
		mockCreate.mockResolvedValueOnce({
			choices: [{ message: { content: "Grok says hello." } }],
			usage: { prompt_tokens: 8, completion_tokens: 15 },
		});

		const result = await callGrok("test prompt", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(result.response).toBe("Grok says hello.");
		expect(result.usage).toEqual({ input: 8, output: 15 });
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
	});

	it("handles empty choices", async () => {
		mockCreate.mockResolvedValueOnce({
			choices: [],
			usage: { prompt_tokens: 5, completion_tokens: 0 },
		});

		const result = await callGrok("test", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(result.response).toBe("");
	});

	it("handles null content", async () => {
		mockCreate.mockResolvedValueOnce({
			choices: [{ message: { content: null } }],
			usage: { prompt_tokens: 5, completion_tokens: 0 },
		});

		const result = await callGrok("test", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(result.response).toBe("");
	});

	it("retries on rate limit error", async () => {
		const error = new Error("rate limit");
		Object.assign(error, { status: 429 });
		mockCreate
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce({
				choices: [{ message: { content: "ok" } }],
				usage: { prompt_tokens: 5, completion_tokens: 10 },
			});

		const result = await callGrok("test", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(result.response).toBe("ok");
		expect(mockCreate).toHaveBeenCalledTimes(2);
	});

	it("uses xAI base URL", async () => {
		mockCreate.mockResolvedValueOnce({
			choices: [{ message: { content: "ok" } }],
			usage: { prompt_tokens: 5, completion_tokens: 10 },
		});

		await callGrok("test", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		const OpenAI = (await import("openai")).default;
		expect(OpenAI).toHaveBeenCalledWith({
			apiKey: "xai-test",
			baseURL: "https://api.x.ai/v1",
		});
	});
});
