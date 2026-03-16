import { describe, expect, it } from "vitest";
import { QUERIES, buildSearchPrompt } from "./queries.js";

describe("queries", () => {
	it("contains at least 10 queries", () => {
		expect(QUERIES.length).toBeGreaterThanOrEqual(10);
	});

	it("each query has required fields", () => {
		for (const query of QUERIES) {
			expect(query.id).toBeTruthy();
			expect(query.category).toBeTruthy();
			expect(query.text).toBeTruthy();
		}
	});

	it("has unique ids", () => {
		const ids = QUERIES.map((q) => q.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("covers multiple categories", () => {
		const categories = new Set(QUERIES.map((q) => q.category));
		expect(categories.size).toBeGreaterThanOrEqual(3);
	});
});

describe("buildSearchPrompt", () => {
	it("includes the query text", () => {
		const prompt = buildSearchPrompt("What is TypeScript?");
		expect(prompt).toContain("What is TypeScript?");
	});

	it("instructs to use web search", () => {
		const prompt = buildSearchPrompt("test query");
		expect(prompt.toLowerCase()).toContain("search");
	});
});
