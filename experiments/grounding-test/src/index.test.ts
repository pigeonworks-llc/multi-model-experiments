import { describe, expect, it } from "vitest";
import { parseArgs } from "./index.js";

describe("parseArgs", () => {
	it("returns defaults with no args", () => {
		const opts = parseArgs([]);
		expect(opts.dryRun).toBe(false);
		expect(opts.conditionFilter).toBeUndefined();
		expect(opts.promptFilter).toBeUndefined();
	});

	it("parses --dry-run flag", () => {
		const opts = parseArgs(["--dry-run"]);
		expect(opts.dryRun).toBe(true);
	});

	it("parses --condition filter", () => {
		const opts = parseArgs(["--condition", "gemini-grounded"]);
		expect(opts.conditionFilter).toBe("gemini-grounded");
	});

	it("parses --prompt filter", () => {
		const opts = parseArgs(["--prompt", "fact-01"]);
		expect(opts.promptFilter).toBe("fact-01");
	});

	it("parses combined flags", () => {
		const opts = parseArgs([
			"--dry-run",
			"--condition",
			"grok",
			"--prompt",
			"anl-03",
		]);
		expect(opts.dryRun).toBe(true);
		expect(opts.conditionFilter).toBe("grok");
		expect(opts.promptFilter).toBe("anl-03");
	});
});
