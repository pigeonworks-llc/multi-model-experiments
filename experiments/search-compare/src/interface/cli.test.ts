import { describe, expect, it } from "vitest";
import { parseArgs } from "./cli.js";

describe("parseArgs", () => {
	it("returns defaults with no args", () => {
		const opts = parseArgs([]);
		expect(opts.prod).toBe(false);
		expect(opts.dryRun).toBe(false);
		expect(opts.queryFilter).toBeUndefined();
		expect(opts.categoryFilter).toBeUndefined();
	});

	it("parses --prod flag", () => {
		const opts = parseArgs(["--prod"]);
		expect(opts.prod).toBe(true);
	});

	it("parses --dry-run flag", () => {
		const opts = parseArgs(["--dry-run"]);
		expect(opts.dryRun).toBe(true);
	});

	it("parses --query filter", () => {
		const opts = parseArgs(["--query", "fact-01"]);
		expect(opts.queryFilter).toBe("fact-01");
	});

	it("parses --category filter", () => {
		const opts = parseArgs(["--category", "technical"]);
		expect(opts.categoryFilter).toBe("technical");
	});

	it("parses combined flags", () => {
		const opts = parseArgs([
			"--prod",
			"--dry-run",
			"--query",
			"rec-01",
			"--category",
			"recent-event",
		]);
		expect(opts.prod).toBe(true);
		expect(opts.dryRun).toBe(true);
		expect(opts.queryFilter).toBe("rec-01");
		expect(opts.categoryFilter).toBe("recent-event");
	});
});
