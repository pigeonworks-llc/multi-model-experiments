import { describe, expect, it } from "vitest";
import { parseArgs } from "./cli.js";

describe("parseArgs", () => {
	it("returns defaults with no args", () => {
		const opts = parseArgs([]);
		expect(opts.prod).toBe(false);
		expect(opts.judge).toBe(false);
		expect(opts.dryRun).toBe(false);
		expect(opts.promptFilter).toBeUndefined();
		expect(opts.modelFilter).toBeUndefined();
	});

	it("parses --prod flag", () => {
		const opts = parseArgs(["--prod"]);
		expect(opts.prod).toBe(true);
	});

	it("parses --judge flag", () => {
		const opts = parseArgs(["--judge"]);
		expect(opts.judge).toBe(true);
	});

	it("parses --dry-run flag", () => {
		const opts = parseArgs(["--dry-run"]);
		expect(opts.dryRun).toBe(true);
	});

	it("parses --prompt filter", () => {
		const opts = parseArgs(["--prompt", "eth-01"]);
		expect(opts.promptFilter).toBe("eth-01");
	});

	it("parses --model filter", () => {
		const opts = parseArgs(["--model", "claude"]);
		expect(opts.modelFilter).toBe("claude");
	});

	it("parses combined flags", () => {
		const opts = parseArgs([
			"--prod",
			"--judge",
			"--prompt",
			"val-01",
			"--model",
			"gemini",
		]);
		expect(opts.prod).toBe(true);
		expect(opts.judge).toBe(true);
		expect(opts.promptFilter).toBe("val-01");
		expect(opts.modelFilter).toBe("gemini");
	});
});
