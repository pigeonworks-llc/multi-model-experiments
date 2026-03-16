import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExperimentRun, JudgedExperimentRun } from "../domain/types.js";
import {
	dateTag,
	loadJsonFile,
	saveJudgedResults,
	saveRawResults,
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
			// Format: YYYY-MM-DDTHHMMSS (15 chars after removing colons/dots)
			expect(tag).toHaveLength(15);
			expect(tag).toMatch(/^\d{4}-\d{2}-\d{2}T\d{4}$/);
		});
	});

	describe("saveRawResults", () => {
		it("saves experiment run to JSON file", () => {
			const run: ExperimentRun = {
				runId: "test-run",
				timestamp: "2026-03-14T00:00:00Z",
				models: [],
				prompts: [],
				responses: [],
			};

			const filePath = saveRawResults(tmpDir, run);
			expect(existsSync(filePath)).toBe(true);
			expect(filePath).toContain("raw-");
			expect(filePath.endsWith(".json")).toBe(true);

			const content = JSON.parse(readFileSync(filePath, "utf-8"));
			expect(content.runId).toBe("test-run");
		});
	});

	describe("saveJudgedResults", () => {
		it("saves judged experiment run to JSON file", () => {
			const run: JudgedExperimentRun = {
				runId: "test-run",
				timestamp: "2026-03-14T00:00:00Z",
				models: [],
				prompts: [],
				responses: [],
				judgeModel: "claude-haiku-4-5-20251001",
			};

			const filePath = saveJudgedResults(tmpDir, run);
			expect(existsSync(filePath)).toBe(true);
			expect(filePath).toContain("judged-");

			const content = JSON.parse(readFileSync(filePath, "utf-8"));
			expect(content.judgeModel).toBe("claude-haiku-4-5-20251001");
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
