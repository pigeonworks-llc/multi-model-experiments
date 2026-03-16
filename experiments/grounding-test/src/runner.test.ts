import { beforeEach, describe, expect, it, vi } from "vitest";
import { runExperiment } from "./runner.js";
import type { Condition, PromptItem } from "./types.js";

describe("runExperiment", () => {
	const mockGrounded = vi.fn();
	const mockPlain = vi.fn();
	const mockGrok = vi.fn();

	const prompts: PromptItem[] = [
		{
			id: "fact-01",
			type: "factual",
			text: "Test question 1",
			verificationMethod: "check docs",
		},
	];
	const conditions: Condition[] = ["gemini-grounded", "gemini-plain", "grok"];
	const dispatch = {
		"gemini-grounded": mockGrounded,
		"gemini-plain": mockPlain,
		grok: mockGrok,
	};
	const config = {
		googleAiApiKey: "google-key",
		xaiApiKey: "xai-key",
		geminiModel: "gemini-2.5-flash",
		grokModel: "grok-3-mini",
	};

	beforeEach(() => {
		mockGrounded.mockReset();
		mockPlain.mockReset();
		mockGrok.mockReset();
		mockGrounded.mockResolvedValue({
			response: "grounded response",
			groundingMetadata: { searchEntryPoint: {} },
			latencyMs: 100,
		});
		mockPlain.mockResolvedValue({
			response: "plain response",
			latencyMs: 80,
		});
		mockGrok.mockResolvedValue({
			response: "grok response",
			latencyMs: 90,
		});
	});

	it("calls each condition for each prompt", async () => {
		const result = await runExperiment({
			conditions,
			prompts,
			dispatch,
			config,
		});

		expect(mockGrounded).toHaveBeenCalledTimes(1);
		expect(mockPlain).toHaveBeenCalledTimes(1);
		expect(mockGrok).toHaveBeenCalledTimes(1);
		expect(result.responses).toHaveLength(3);
	});

	it("returns valid ExperimentRun structure", async () => {
		const result = await runExperiment({
			conditions,
			prompts,
			dispatch,
			config,
		});

		expect(result.runId).toBeTruthy();
		expect(result.timestamp).toBeTruthy();
		expect(result.conditions).toEqual(conditions);
		expect(result.prompts).toEqual(prompts);
	});

	it("includes condition and model in each response", async () => {
		const result = await runExperiment({
			conditions,
			prompts,
			dispatch,
			config,
		});

		const conditionValues = result.responses.map((r) => r.condition);
		expect(conditionValues).toContain("gemini-grounded");
		expect(conditionValues).toContain("gemini-plain");
		expect(conditionValues).toContain("grok");
	});

	it("preserves grounding metadata in grounded responses", async () => {
		const result = await runExperiment({
			conditions: ["gemini-grounded"],
			prompts,
			dispatch,
			config,
		});

		const grounded = result.responses.find(
			(r) => r.condition === "gemini-grounded",
		);
		expect(grounded?.groundingMetadata).toEqual({
			searchEntryPoint: {},
		});
	});

	it("skips failed calls and continues", async () => {
		mockGrounded.mockRejectedValue(new Error("API error"));

		const result = await runExperiment({
			conditions,
			prompts,
			dispatch,
			config,
		});

		// grounded fails, plain and grok succeed
		expect(result.responses).toHaveLength(2);
		const conditionValues = result.responses.map((r) => r.condition);
		expect(conditionValues).toContain("gemini-plain");
		expect(conditionValues).toContain("grok");
	});

	it("calls onProgress callback", async () => {
		const progress: string[] = [];
		await runExperiment({
			conditions,
			prompts,
			dispatch,
			config,
			onProgress: (msg) => progress.push(msg),
		});

		expect(progress.length).toBeGreaterThan(0);
	});

	it("handles multiple prompts x conditions", async () => {
		const multiPrompts: PromptItem[] = [
			{
				id: "fact-01",
				type: "factual",
				text: "Q1",
				verificationMethod: "v1",
			},
			{
				id: "fact-02",
				type: "factual",
				text: "Q2",
				verificationMethod: "v2",
			},
		];

		const result = await runExperiment({
			conditions,
			prompts: multiPrompts,
			dispatch,
			config,
		});

		// 2 prompts x 3 conditions = 6
		expect(result.responses).toHaveLength(6);
	});
});
