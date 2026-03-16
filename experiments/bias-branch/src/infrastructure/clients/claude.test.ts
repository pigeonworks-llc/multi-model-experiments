import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
	default: vi.fn().mockImplementation(() => ({
		messages: { create: mockCreate },
	})),
}));

import { callClaude } from "./claude.js";

describe("callClaude", () => {
	beforeEach(() => {
		mockCreate.mockReset();
	});

	it("returns response with usage and latency", async () => {
		mockCreate.mockResolvedValueOnce({
			content: [{ type: "text", text: "AI safety is important." }],
			usage: { input_tokens: 15, output_tokens: 25 },
		});

		const result = await callClaude("test prompt", {
			apiKey: "sk-test",
			model: "claude-haiku-4-5-20251001",
		});

		expect(result.response).toBe("AI safety is important.");
		expect(result.usage).toEqual({ input: 15, output: 25 });
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
		expect(mockCreate).toHaveBeenCalledWith({
			model: "claude-haiku-4-5-20251001",
			max_tokens: 2048,
			messages: [{ role: "user", content: "test prompt" }],
		});
	});

	it("extracts text from multiple content blocks", async () => {
		mockCreate.mockResolvedValueOnce({
			content: [
				{ type: "text", text: "Part 1. " },
				{ type: "text", text: "Part 2." },
			],
			usage: { input_tokens: 10, output_tokens: 20 },
		});

		const result = await callClaude("test", {
			apiKey: "sk-test",
			model: "claude-haiku-4-5-20251001",
		});

		expect(result.response).toBe("Part 1. Part 2.");
	});

	it("retries on rate limit error", async () => {
		const rateLimitError = new Error("rate limit");
		Object.assign(rateLimitError, { status: 429 });
		mockCreate
			.mockRejectedValueOnce(rateLimitError)
			.mockResolvedValueOnce({
				content: [{ type: "text", text: "ok" }],
				usage: { input_tokens: 5, output_tokens: 10 },
			});

		const result = await callClaude("test", {
			apiKey: "sk-test",
			model: "claude-haiku-4-5-20251001",
		});

		expect(result.response).toBe("ok");
		expect(mockCreate).toHaveBeenCalledTimes(2);
	});

	it("throws after max retries", async () => {
		const error = new Error("rate limit");
		Object.assign(error, { status: 429 });
		mockCreate.mockRejectedValue(error);

		await expect(
			callClaude("test", {
				apiKey: "sk-test",
				model: "claude-haiku-4-5-20251001",
			}),
		).rejects.toThrow("rate limit");

		expect(mockCreate).toHaveBeenCalledTimes(3);
	});
});
