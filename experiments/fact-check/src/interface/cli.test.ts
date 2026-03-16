import { describe, expect, it } from "vitest";
import { parseArgs } from "./cli.js";

describe("parseArgs", () => {
	it("returns defaults with no args", () => {
		const opts = parseArgs([]);
		expect(opts.prod).toBe(false);
		expect(opts.dryRun).toBe(false);
		expect(opts.claimFilter).toBeUndefined();
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

	it("parses --claim filter", () => {
		const opts = parseArgs(["--claim", "hist-01"]);
		expect(opts.claimFilter).toBe("hist-01");
	});

	it("parses --category filter", () => {
		const opts = parseArgs(["--category", "scientific"]);
		expect(opts.categoryFilter).toBe("scientific");
	});

	it("parses combined flags", () => {
		const opts = parseArgs([
			"--prod",
			"--dry-run",
			"--claim",
			"sci-01",
			"--category",
			"scientific",
		]);
		expect(opts.prod).toBe(true);
		expect(opts.dryRun).toBe(true);
		expect(opts.claimFilter).toBe("sci-01");
		expect(opts.categoryFilter).toBe("scientific");
	});
});
