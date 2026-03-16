import { beforeEach, describe, expect, it, vi } from "vitest";
import { runExperiment } from "./run-experiment.js";
import type {
	CallFn,
	ExperimentRun,
	ModelConfig,
	PromptItem,
} from "../domain/types.js";

describe("runExperiment", () => {
	const mockCallFn = vi.fn<CallFn>();
	const models: ModelConfig[] = [
		{ provider: "claude", modelId: "test-claude", displayName: "Claude" },
		{ provider: "gemini", modelId: "test-gemini", displayName: "Gemini" },
	];
	const prompts: PromptItem[] = [
		{
			id: "t-01",
			category: "ethics-tradeoff",
			text: "Test question 1",
			expectedDivergenceAxis: "test axis",
		},
	];
	const dispatch = {
		claude: mockCallFn,
		gemini: mockCallFn,
		grok: mockCallFn,
	};

	beforeEach(() => {
		mockCallFn.mockReset();
		mockCallFn.mockResolvedValue({
			response: "mock response",
			usage: { input: 10, output: 20 },
			latencyMs: 100,
		});
	});

	it("calls each model for each prompt", async () => {
		const result = await runExperiment({
			models,
			prompts,
			dispatch,
			apiKeys: {
				claude: "key1",
				gemini: "key2",
				grok: "key3",
			},
		});

		expect(mockCallFn).toHaveBeenCalledTimes(2); // 1 prompt x 2 models
		expect(result.responses).toHaveLength(2);
	});

	it("returns valid ExperimentRun structure", async () => {
		const result = await runExperiment({
			models,
			prompts,
			dispatch,
			apiKeys: {
				claude: "key1",
				gemini: "key2",
				grok: "key3",
			},
		});

		expect(result.runId).toBeTruthy();
		expect(result.timestamp).toBeTruthy();
		expect(result.models).toEqual(models);
		expect(result.prompts).toEqual(prompts);
		for (const resp of result.responses) {
			expect(resp.promptId).toBe("t-01");
			expect(resp.response).toBe("mock response");
			expect(resp.tokenUsage).toEqual({ input: 10, output: 20 });
		}
	});

	it("includes provider info in each response", async () => {
		const result = await runExperiment({
			models,
			prompts,
			dispatch,
			apiKeys: {
				claude: "key1",
				gemini: "key2",
				grok: "key3",
			},
		});

		const providers = result.responses.map((r) => r.provider);
		expect(providers).toContain("claude");
		expect(providers).toContain("gemini");
	});

	it("calls onProgress callback", async () => {
		const progress: string[] = [];
		await runExperiment({
			models,
			prompts,
			dispatch,
			apiKeys: {
				claude: "key1",
				gemini: "key2",
				grok: "key3",
			},
			onProgress: (msg) => progress.push(msg),
		});

		expect(progress.length).toBeGreaterThan(0);
	});
});
