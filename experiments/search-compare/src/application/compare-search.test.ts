import { beforeEach, describe, expect, it, vi } from "vitest";
import { compareSearch } from "./compare-search.js";
import type { ClientResult, QueryItem } from "../domain/types.js";

describe("compareSearch", () => {
	const mockGrokFn = vi.fn<
		(prompt: string, config: { apiKey: string; model: string }) => Promise<ClientResult>
	>();
	const mockGeminiFn = vi.fn<
		(prompt: string, config: { apiKey: string; model: string }) => Promise<ClientResult>
	>();

	const queries: QueryItem[] = [
		{
			id: "test-01",
			category: "factual",
			text: "What is the capital of France?",
		},
		{
			id: "test-02",
			category: "technical",
			text: "What is TypeScript?",
		},
	];

	beforeEach(() => {
		mockGrokFn.mockReset();
		mockGeminiFn.mockReset();
		mockGrokFn.mockResolvedValue({
			response: "Grok answer",
			sources: [],
			usage: { input: 30, output: 50 },
			latencyMs: 300,
		});
		mockGeminiFn.mockResolvedValue({
			response: "Gemini answer",
			sources: [],
			usage: { input: 20, output: 40 },
			latencyMs: 200,
		});
	});

	it("compares each query across both providers", async () => {
		const run = await compareSearch({
			queries,
			grokCallFn: mockGrokFn,
			geminiCallFn: mockGeminiFn,
			grokApiKey: "xai-test",
			geminiApiKey: "ai-test",
			grokModel: "grok-4-1-fast",
			geminiModel: "gemini-2.5-flash",
		});

		expect(mockGrokFn).toHaveBeenCalledTimes(2);
		expect(mockGeminiFn).toHaveBeenCalledTimes(2);
		expect(run.results).toHaveLength(2);
	});

	it("returns valid ComparisonRun structure", async () => {
		const run = await compareSearch({
			queries,
			grokCallFn: mockGrokFn,
			geminiCallFn: mockGeminiFn,
			grokApiKey: "xai-test",
			geminiApiKey: "ai-test",
			grokModel: "grok-4-1-fast",
			geminiModel: "gemini-2.5-flash",
		});

		expect(run.runId).toBeTruthy();
		expect(run.timestamp).toBeTruthy();
		expect(run.grokModel).toBe("grok-4-1-fast");
		expect(run.geminiModel).toBe("gemini-2.5-flash");
		expect(run.queries).toEqual(queries);

		for (const result of run.results) {
			expect(result.grok.response).toBe("Grok answer");
			expect(result.gemini.response).toBe("Gemini answer");
		}
	});

	it("calls onProgress callback", async () => {
		const progress: string[] = [];
		await compareSearch({
			queries,
			grokCallFn: mockGrokFn,
			geminiCallFn: mockGeminiFn,
			grokApiKey: "xai-test",
			geminiApiKey: "ai-test",
			grokModel: "grok-4-1-fast",
			geminiModel: "gemini-2.5-flash",
			onProgress: (msg) => progress.push(msg),
		});

		expect(progress.length).toBeGreaterThan(0);
	});

	it("handles Grok API error gracefully", async () => {
		mockGrokFn.mockRejectedValue(new Error("Grok API error"));

		const run = await compareSearch({
			queries: [queries[0]],
			grokCallFn: mockGrokFn,
			geminiCallFn: mockGeminiFn,
			grokApiKey: "xai-test",
			geminiApiKey: "ai-test",
			grokModel: "grok-4-1-fast",
			geminiModel: "gemini-2.5-flash",
		});

		expect(run.results).toHaveLength(1);
		expect(run.results[0].grok.response).toContain("ERROR");
	});

	it("handles Gemini API error gracefully", async () => {
		mockGeminiFn.mockRejectedValue(new Error("Gemini API error"));

		const run = await compareSearch({
			queries: [queries[0]],
			grokCallFn: mockGrokFn,
			geminiCallFn: mockGeminiFn,
			grokApiKey: "xai-test",
			geminiApiKey: "ai-test",
			grokModel: "grok-4-1-fast",
			geminiModel: "gemini-2.5-flash",
		});

		expect(run.results).toHaveLength(1);
		expect(run.results[0].gemini.response).toContain("ERROR");
	});
});
