import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreate = vi.fn();

vi.mock("openai", () => ({
	default: vi.fn().mockImplementation(() => ({
		responses: { create: mockCreate },
	})),
}));

import { callGrokSearch } from "./grok-search.js";

describe("callGrokSearch", () => {
	beforeEach(() => {
		mockCreate.mockReset();
	});

	it("returns response with sources and usage", async () => {
		mockCreate.mockResolvedValueOnce({
			output: [
				{
					type: "message",
					content: [{ type: "output_text", text: "Search result." }],
				},
			],
			usage: { input_tokens: 50, output_tokens: 100 },
		});

		const result = await callGrokSearch("test query", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(result.response).toBe("Search result.");
		expect(result.usage).toEqual({ input: 50, output: 100 });
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
	});

	it("handles empty output", async () => {
		mockCreate.mockResolvedValueOnce({
			output: [],
			usage: { input_tokens: 5, output_tokens: 0 },
		});

		const result = await callGrokSearch("test", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(result.response).toBe("");
	});

	it("handles missing usage", async () => {
		mockCreate.mockResolvedValueOnce({
			output: [
				{
					type: "message",
					content: [{ type: "output_text", text: "ok" }],
				},
			],
		});

		const result = await callGrokSearch("test", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(result.usage).toEqual({ input: 0, output: 0 });
	});

	it("uses xAI base URL", async () => {
		mockCreate.mockResolvedValueOnce({
			output: [
				{
					type: "message",
					content: [{ type: "output_text", text: "ok" }],
				},
			],
			usage: { input_tokens: 5, output_tokens: 10 },
		});

		await callGrokSearch("test", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		const OpenAI = (await import("openai")).default;
		expect(OpenAI).toHaveBeenCalledWith({
			apiKey: "xai-test",
			baseURL: "https://api.x.ai/v1",
		});
	});

	it("passes web_search tool", async () => {
		mockCreate.mockResolvedValueOnce({
			output: [
				{
					type: "message",
					content: [{ type: "output_text", text: "ok" }],
				},
			],
			usage: { input_tokens: 5, output_tokens: 10 },
		});

		await callGrokSearch("test prompt", {
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(mockCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				model: "grok-3-mini",
				tools: [{ type: "web_search" }],
			}),
		);
	});
});
