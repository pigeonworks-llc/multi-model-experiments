import { describe, expect, it } from "vitest";
import type {
	Condition,
	ExperimentRun,
	ModelResponse,
	PromptItem,
	PromptType,
} from "./types.js";

describe("types", () => {
	it("Condition accepts valid values", () => {
		const conditions: Condition[] = ["gemini-grounded", "gemini-plain", "grok"];
		expect(conditions).toHaveLength(3);
	});

	it("PromptType accepts valid values", () => {
		const types: PromptType[] = ["factual", "analytical"];
		expect(types).toHaveLength(2);
	});

	it("PromptItem structure is valid", () => {
		const prompt: PromptItem = {
			id: "fact-01",
			type: "factual",
			text: "test prompt",
			verificationMethod: "check official docs",
		};
		expect(prompt.id).toBe("fact-01");
		expect(prompt.type).toBe("factual");
		expect(prompt.verificationMethod).toBe("check official docs");
	});

	it("ModelResponse structure is valid", () => {
		const response: ModelResponse = {
			promptId: "fact-01",
			condition: "gemini-grounded",
			model: "gemini-2.5-flash",
			response: "test response",
			latencyMs: 500,
			timestamp: "2026-03-15T00:00:00Z",
		};
		expect(response.condition).toBe("gemini-grounded");
		expect(response.latencyMs).toBe(500);
	});

	it("ModelResponse accepts optional groundingMetadata", () => {
		const response: ModelResponse = {
			promptId: "fact-01",
			condition: "gemini-grounded",
			model: "gemini-2.5-flash",
			response: "grounded response",
			groundingMetadata: {
				searchEntryPoint: { renderedContent: "<html>" },
				groundingChunks: [{ web: { uri: "https://example.com" } }],
			},
			latencyMs: 800,
			timestamp: "2026-03-15T00:00:00Z",
		};
		expect(response.groundingMetadata).toBeDefined();
	});

	it("ModelResponse works without groundingMetadata", () => {
		const response: ModelResponse = {
			promptId: "fact-01",
			condition: "grok",
			model: "grok-3-mini",
			response: "plain response",
			latencyMs: 300,
			timestamp: "2026-03-15T00:00:00Z",
		};
		expect(response.groundingMetadata).toBeUndefined();
	});

	it("ExperimentRun holds complete run data", () => {
		const run: ExperimentRun = {
			runId: "run-001",
			timestamp: "2026-03-15T00:00:00Z",
			conditions: ["gemini-grounded", "gemini-plain", "grok"],
			prompts: [
				{
					id: "fact-01",
					type: "factual",
					text: "test",
					verificationMethod: "check docs",
				},
			],
			responses: [],
		};
		expect(run.runId).toBe("run-001");
		expect(run.conditions).toHaveLength(3);
		expect(run.prompts).toHaveLength(1);
	});
});
