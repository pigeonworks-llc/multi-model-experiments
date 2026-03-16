import { describe, expect, it } from "vitest";
import { CLAIMS, buildVerificationPrompt } from "./claims.js";

describe("claims", () => {
	it("contains at least 10 claims", () => {
		expect(CLAIMS.length).toBeGreaterThanOrEqual(10);
	});

	it("each claim has required fields", () => {
		for (const claim of CLAIMS) {
			expect(claim.id).toBeTruthy();
			expect(claim.category).toBeTruthy();
			expect(claim.text).toBeTruthy();
			expect(claim.expectedVerdict).toBeTruthy();
		}
	});

	it("has unique ids", () => {
		const ids = CLAIMS.map((c) => c.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("covers multiple categories", () => {
		const categories = new Set(CLAIMS.map((c) => c.category));
		expect(categories.size).toBeGreaterThanOrEqual(3);
	});
});

describe("buildVerificationPrompt", () => {
	it("includes the claim text", () => {
		const prompt = buildVerificationPrompt("The earth is flat.");
		expect(prompt).toContain("The earth is flat.");
	});

	it("instructs JSON output", () => {
		const prompt = buildVerificationPrompt("test claim");
		expect(prompt).toContain("JSON");
	});

	it("asks for verdict", () => {
		const prompt = buildVerificationPrompt("test claim");
		expect(prompt).toContain("verdict");
	});
});
