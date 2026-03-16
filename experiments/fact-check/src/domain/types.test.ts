import { describe, expect, it } from "vitest";
import type {
	Claim,
	ClaimCategory,
	ClientResult,
	Confidence,
	SearchSource,
	TokenUsage,
	Verdict,
	VerificationResult,
	VerificationRun,
} from "./types.js";

describe("types", () => {
	it("Verdict accepts valid values", () => {
		const verdicts: Verdict[] = [
			"true",
			"false",
			"partially-true",
			"unverifiable",
		];
		expect(verdicts).toHaveLength(4);
	});

	it("Confidence accepts valid values", () => {
		const levels: Confidence[] = ["high", "medium", "low"];
		expect(levels).toHaveLength(3);
	});

	it("ClaimCategory accepts valid values", () => {
		const categories: ClaimCategory[] = [
			"historical",
			"scientific",
			"statistical",
			"current-event",
			"technical",
		];
		expect(categories).toHaveLength(5);
	});

	it("Claim structure is valid", () => {
		const claim: Claim = {
			id: "hist-01",
			category: "historical",
			text: "The Great Wall of China is visible from space.",
			expectedVerdict: "false",
		};
		expect(claim.id).toBe("hist-01");
		expect(claim.category).toBe("historical");
	});

	it("SearchSource structure is valid", () => {
		const source: SearchSource = {
			title: "NASA FAQ",
			url: "https://nasa.gov/faq",
			snippet: "The wall is not visible from space.",
		};
		expect(source.url).toContain("nasa");
	});

	it("VerificationResult structure is valid", () => {
		const result: VerificationResult = {
			claimId: "hist-01",
			verdict: "false",
			confidence: "high",
			explanation: "NASA confirms it is not visible.",
			sources: [
				{
					title: "NASA",
					url: "https://nasa.gov",
					snippet: "Not visible",
				},
			],
			tokenUsage: { input: 50, output: 100 },
			latencyMs: 1200,
			timestamp: "2026-03-16T00:00:00Z",
		};
		expect(result.verdict).toBe("false");
		expect(result.sources).toHaveLength(1);
	});

	it("VerificationRun holds complete run data", () => {
		const run: VerificationRun = {
			runId: "run-001",
			timestamp: "2026-03-16T00:00:00Z",
			model: "grok-3-mini",
			claims: [],
			results: [],
		};
		expect(run.runId).toBe("run-001");
		expect(run.model).toBe("grok-3-mini");
	});

	it("ClientResult structure is valid", () => {
		const result: ClientResult = {
			response: "test",
			sources: [],
			usage: { input: 10, output: 20 },
			latencyMs: 500,
		};
		expect(result.latencyMs).toBe(500);
	});
});
