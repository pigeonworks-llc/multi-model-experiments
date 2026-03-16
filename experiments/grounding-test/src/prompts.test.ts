import { describe, expect, it } from "vitest";
import { PROMPTS } from "./prompts.js";
import type { PromptType } from "./types.js";

describe("prompts", () => {
	it("has 10 prompts", () => {
		expect(PROMPTS).toHaveLength(10);
	});

	it("has 5 factual prompts", () => {
		const count = PROMPTS.filter((p) => p.type === "factual").length;
		expect(count).toBe(5);
	});

	it("has 5 analytical prompts", () => {
		const count = PROMPTS.filter((p) => p.type === "analytical").length;
		expect(count).toBe(5);
	});

	it("has unique ids", () => {
		const ids = PROMPTS.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("every prompt has non-empty text", () => {
		for (const p of PROMPTS) {
			expect(p.text.length, `${p.id} text`).toBeGreaterThan(0);
		}
	});

	it("every prompt has a verification method", () => {
		for (const p of PROMPTS) {
			expect(
				p.verificationMethod.length,
				`${p.id} verificationMethod`,
			).toBeGreaterThan(0);
		}
	});

	it("factual prompt ids start with 'fact-'", () => {
		const factual = PROMPTS.filter((p) => p.type === "factual");
		for (const p of factual) {
			expect(p.id, `${p.id} prefix`).toMatch(/^fact-/);
		}
	});

	it("analytical prompt ids start with 'anl-'", () => {
		const analytical = PROMPTS.filter((p) => p.type === "analytical");
		for (const p of analytical) {
			expect(p.id, `${p.id} prefix`).toMatch(/^anl-/);
		}
	});
});
