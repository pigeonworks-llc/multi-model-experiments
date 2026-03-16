import { describe, expect, it } from "vitest";
import type {
	CallFn,
	ClientResult,
	Confidence,
	ExperimentRun,
	JudgeResult,
	JudgedExperimentRun,
	JudgedResponse,
	ModelConfig,
	ModelProvider,
	ModelResponse,
	PromptCategory,
	PromptItem,
	Stance,
	TokenUsage,
} from "./types.js";

describe("types", () => {
	it("ModelProvider accepts valid values", () => {
		const providers: ModelProvider[] = ["claude", "gemini", "grok"];
		expect(providers).toHaveLength(3);
	});

	it("PromptCategory accepts valid values", () => {
		const categories: PromptCategory[] = [
			"ethics-tradeoff",
			"fact-opinion-boundary",
			"uncertainty-expression",
			"value-framing",
			"self-assessment",
			"translation",
		];
		expect(categories).toHaveLength(6);
	});

	it("Stance accepts valid values", () => {
		const stances: Stance[] = ["agree", "disagree", "nuanced", "refuse"];
		expect(stances).toHaveLength(4);
	});

	it("Confidence accepts valid values", () => {
		const levels: Confidence[] = ["high", "medium", "low"];
		expect(levels).toHaveLength(3);
	});

	it("PromptItem structure is valid", () => {
		const prompt: PromptItem = {
			id: "eth-01",
			category: "ethics-tradeoff",
			text: "test prompt",
			expectedDivergenceAxis: "CAI vs permissive",
		};
		expect(prompt.id).toBe("eth-01");
		expect(prompt.category).toBe("ethics-tradeoff");
	});

	it("ModelResponse structure is valid", () => {
		const response: ModelResponse = {
			promptId: "eth-01",
			provider: "claude",
			modelId: "claude-haiku-4-5-20251001",
			response: "test response",
			tokenUsage: { input: 10, output: 20 },
			latencyMs: 500,
			timestamp: "2026-03-14T00:00:00Z",
		};
		expect(response.provider).toBe("claude");
		expect(response.tokenUsage.input).toBe(10);
	});

	it("JudgedResponse extends ModelResponse with judge", () => {
		const judged: JudgedResponse = {
			promptId: "eth-01",
			provider: "gemini",
			modelId: "gemini-2.0-flash",
			response: "test",
			tokenUsage: { input: 5, output: 15 },
			latencyMs: 300,
			timestamp: "2026-03-14T00:00:00Z",
			judge: {
				stance: "nuanced",
				confidence: "medium",
				keyThemes: ["safety", "openness"],
				summary: "Balanced view",
			},
		};
		expect(judged.judge.stance).toBe("nuanced");
		expect(judged.judge.keyThemes).toHaveLength(2);
	});

	it("ExperimentRun holds complete run data", () => {
		const run: ExperimentRun = {
			runId: "run-001",
			timestamp: "2026-03-14T00:00:00Z",
			models: [
				{
					provider: "claude",
					modelId: "claude-haiku-4-5-20251001",
					displayName: "Claude Haiku",
				},
			],
			prompts: [
				{
					id: "eth-01",
					category: "ethics-tradeoff",
					text: "test",
					expectedDivergenceAxis: "test axis",
				},
			],
			responses: [],
		};
		expect(run.runId).toBe("run-001");
		expect(run.models).toHaveLength(1);
	});

	it("CallFn type is assignable to async functions", () => {
		const fn: CallFn = async (_prompt, _config) => ({
			response: "ok",
			usage: { input: 1, output: 2 },
			latencyMs: 100,
		});
		expect(typeof fn).toBe("function");
	});
});
