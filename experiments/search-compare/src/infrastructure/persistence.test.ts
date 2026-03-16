import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ComparisonRun } from "../domain/types.js";
import {
	dateTag,
	loadJsonFile,
	saveComparisonRun,
} from "./persistence.js";

describe("persistence", () => {
	const tmpDir = join(
		import.meta.dirname ?? ".",
		"..",
		"..",
		"tmp-test-persistence",
	);

	beforeEach(() => {
		mkdirSync(tmpDir, { recursive: true });
	});

	afterEach(() => {
		rmSync(tmpDir, { recursive: true, force: true });
	});

	describe("dateTag", () => {
		it("returns a string in expected format", () => {
			const tag = dateTag();
			expect(tag).toHaveLength(15);
			expect(tag).toMatch(/^\d{4}-\d{2}-\d{2}T\d{4}$/);
		});
	});

	describe("saveComparisonRun", () => {
		it("saves run to JSON file", () => {
			const run: ComparisonRun = {
				runId: "test-run",
				timestamp: "2026-03-16T00:00:00Z",
				grokModel: "grok-4-1-fast",
				geminiModel: "gemini-2.5-flash",
				queries: [],
				results: [],
			};

			const filePath = saveComparisonRun(tmpDir, run);
			expect(existsSync(filePath)).toBe(true);
			expect(filePath).toContain("search-compare-");
			expect(filePath.endsWith(".json")).toBe(true);

			const content = JSON.parse(readFileSync(filePath, "utf-8"));
			expect(content.runId).toBe("test-run");
		});
	});

	describe("loadJsonFile", () => {
		it("loads and parses JSON file", () => {
			const data = { key: "value", num: 42 };
			const filePath = join(tmpDir, "test.json");
			const { writeFileSync } = require("node:fs");
			writeFileSync(filePath, JSON.stringify(data));

			const result = loadJsonFile<{ key: string; num: number }>(filePath);
			expect(result.key).toBe("value");
			expect(result.num).toBe(42);
		});
	});
});
