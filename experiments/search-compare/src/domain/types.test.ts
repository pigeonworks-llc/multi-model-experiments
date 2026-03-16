import { describe, expect, it } from "vitest";
import type {
	ClientResult,
	ComparisonResult,
	ComparisonRun,
	Confidence,
	QueryCategory,
	QueryItem,
	SearchProvider,
	SearchSource,
	TokenUsage,
} from "./types.js";

describe("types", () => {
	it("SearchProvider accepts valid values", () => {
		const providers: SearchProvider[] = ["grok", "gemini"];
		expect(providers).toHaveLength(2);
	});

	it("Confidence accepts valid values", () => {
		const levels: Confidence[] = ["high", "medium", "low"];
		expect(levels).toHaveLength(3);
	});

	it("QueryCategory accepts valid values", () => {
		const categories: QueryCategory[] = [
			"factual",
			"recent-event",
			"technical",
			"statistical",
			"controversial",
		];
		expect(categories).toHaveLength(5);
	});

	it("QueryItem structure is valid", () => {
		const query: QueryItem = {
			id: "fact-01",
			category: "factual",
			text: "What is the capital of France?",
		};
		expect(query.id).toBe("fact-01");
		expect(query.category).toBe("factual");
	});

	it("SearchSource structure is valid", () => {
		const source: SearchSource = {
			title: "Wikipedia",
			url: "https://wikipedia.org",
			snippet: "Paris is the capital.",
		};
		expect(source.url).toContain("wikipedia");
	});

	it("ClientResult structure is valid", () => {
		const result: ClientResult = {
			response: "Paris",
			sources: [],
			usage: { input: 10, output: 5 },
			latencyMs: 200,
		};
		expect(result.latencyMs).toBe(200);
	});

	it("ComparisonResult holds both provider results", () => {
		const result: ComparisonResult = {
			queryId: "fact-01",
			grok: {
				response: "Paris",
				sources: [],
				usage: { input: 10, output: 5 },
				latencyMs: 200,
			},
			gemini: {
				response: "Paris",
				sources: [],
				usage: { input: 8, output: 4 },
				latencyMs: 150,
			},
			timestamp: "2026-03-16T00:00:00Z",
		};
		expect(result.grok.response).toBe("Paris");
		expect(result.gemini.response).toBe("Paris");
	});

	it("ComparisonRun holds complete run data", () => {
		const run: ComparisonRun = {
			runId: "run-001",
			timestamp: "2026-03-16T00:00:00Z",
			grokModel: "grok-4-1-fast",
			geminiModel: "gemini-2.5-flash",
			queries: [],
			results: [],
		};
		expect(run.runId).toBe("run-001");
		expect(run.grokModel).toBe("grok-4-1-fast");
	});
});
