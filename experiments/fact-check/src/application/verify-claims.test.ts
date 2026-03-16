import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyClaims } from "./verify-claims.js";
import type { Claim, ClientResult } from "../domain/types.js";

describe("verifyClaims", () => {
	const mockCallFn = vi.fn<
		(prompt: string, config: { apiKey: string; model: string }) => Promise<ClientResult>
	>();

	const claims: Claim[] = [
		{
			id: "test-01",
			category: "historical",
			text: "The earth is round.",
			expectedVerdict: "true",
		},
		{
			id: "test-02",
			category: "scientific",
			text: "Water boils at 50 degrees Celsius.",
			expectedVerdict: "false",
		},
	];

	beforeEach(() => {
		mockCallFn.mockReset();
		mockCallFn.mockResolvedValue({
			response: JSON.stringify({
				verdict: "true",
				confidence: "high",
				explanation: "This is verified.",
				sources: [
					{
						title: "Source",
						url: "https://example.com",
						snippet: "Evidence",
					},
				],
			}),
			sources: [],
			usage: { input: 50, output: 100 },
			latencyMs: 500,
		});
	});

	it("verifies each claim and returns results", async () => {
		const run = await verifyClaims({
			claims,
			callFn: mockCallFn,
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(mockCallFn).toHaveBeenCalledTimes(2);
		expect(run.results).toHaveLength(2);
		expect(run.model).toBe("grok-3-mini");
	});

	it("returns valid VerificationRun structure", async () => {
		const run = await verifyClaims({
			claims,
			callFn: mockCallFn,
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(run.runId).toBeTruthy();
		expect(run.timestamp).toBeTruthy();
		expect(run.claims).toEqual(claims);
		for (const result of run.results) {
			expect(result.verdict).toBe("true");
			expect(result.confidence).toBe("high");
		}
	});

	it("calls onProgress callback", async () => {
		const progress: string[] = [];
		await verifyClaims({
			claims,
			callFn: mockCallFn,
			apiKey: "xai-test",
			model: "grok-3-mini",
			onProgress: (msg) => progress.push(msg),
		});

		expect(progress.length).toBeGreaterThan(0);
	});

	it("handles non-JSON response gracefully", async () => {
		mockCallFn.mockResolvedValue({
			response: "This is not valid JSON at all.",
			sources: [],
			usage: { input: 10, output: 20 },
			latencyMs: 300,
		});

		const run = await verifyClaims({
			claims: [claims[0]],
			callFn: mockCallFn,
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(run.results).toHaveLength(1);
		expect(run.results[0].verdict).toBe("unverifiable");
		expect(run.results[0].confidence).toBe("low");
	});

	it("handles API errors gracefully", async () => {
		mockCallFn.mockRejectedValue(new Error("API error"));

		const run = await verifyClaims({
			claims: [claims[0]],
			callFn: mockCallFn,
			apiKey: "xai-test",
			model: "grok-3-mini",
		});

		expect(run.results).toHaveLength(1);
		expect(run.results[0].verdict).toBe("unverifiable");
		expect(run.results[0].explanation).toContain("API error");
	});
});
