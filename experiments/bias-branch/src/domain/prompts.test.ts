import { describe, expect, it } from "vitest";
import { PROMPTS } from "./prompts.js";
import type { PromptCategory } from "./types.js";

describe("prompts", () => {
	it("has 24 prompts", () => {
		expect(PROMPTS).toHaveLength(24);
	});

	it("has 4 prompts per category", () => {
		const categories: PromptCategory[] = [
			"ethics-tradeoff",
			"fact-opinion-boundary",
			"uncertainty-expression",
			"value-framing",
			"self-assessment",
			"translation",
		];
		for (const cat of categories) {
			const count = PROMPTS.filter((p) => p.category === cat).length;
			expect(count, `category ${cat}`).toBe(4);
		}
	});

	it("has unique ids", () => {
		const ids = PROMPTS.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("every prompt has non-empty text and divergence axis", () => {
		for (const p of PROMPTS) {
			expect(p.text.length, `${p.id} text`).toBeGreaterThan(0);
			expect(
				p.expectedDivergenceAxis.length,
				`${p.id} axis`,
			).toBeGreaterThan(0);
		}
	});
});
