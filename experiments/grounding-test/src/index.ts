#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { config as loadEnv } from "dotenv";
import { callGeminiGrounded } from "./clients/gemini-grounded.js";
import { callGeminiPlain } from "./clients/gemini-plain.js";
import { callGrok } from "./clients/grok.js";
import { PROMPTS } from "./prompts.js";
import { type ConditionCallFn, runExperiment } from "./runner.js";
import type { Condition } from "./types.js";

loadEnv();

export interface CliOptions {
	dryRun: boolean;
	conditionFilter?: string;
	promptFilter?: string;
}

export function parseArgs(args: string[]): CliOptions {
	const opts: CliOptions = {
		dryRun: false,
	};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--dry-run":
				opts.dryRun = true;
				break;
			case "--condition":
				opts.conditionFilter = args[++i];
				break;
			case "--prompt":
				opts.promptFilter = args[++i];
				break;
		}
	}

	return opts;
}

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable: ${name}`);
	}
	return value;
}

const RESULTS_DIR = join(
	import.meta.dirname ?? new URL(".", import.meta.url).pathname,
	"..",
	"results",
);

function dateTag(): string {
	return new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
}

const ALL_CONDITIONS: Condition[] = ["gemini-grounded", "gemini-plain", "grok"];

async function main(): Promise<void> {
	const opts = parseArgs(process.argv.slice(2));

	const dispatch: Record<Condition, ConditionCallFn> = {
		"gemini-grounded": callGeminiGrounded,
		"gemini-plain": callGeminiPlain,
		grok: callGrok,
	};

	let prompts = [...PROMPTS];
	let conditions = [...ALL_CONDITIONS];

	if (opts.promptFilter) {
		prompts = prompts.filter((p) => p.id === opts.promptFilter);
		if (prompts.length === 0) {
			console.error(`No prompt found with id: ${opts.promptFilter}`);
			process.exit(1);
		}
	}

	if (opts.conditionFilter) {
		conditions = conditions.filter((c) => c === opts.conditionFilter);
		if (conditions.length === 0) {
			console.error(`No condition found: ${opts.conditionFilter}`);
			process.exit(1);
		}
	}

	console.log(
		`Running ${prompts.length} prompts x ${conditions.length} conditions${opts.dryRun ? " (dry run)" : ""}`,
	);

	if (opts.dryRun) {
		for (const p of prompts) {
			for (const c of conditions) {
				console.log(`  ${c} x ${p.id}: ${p.text.slice(0, 60)}...`);
			}
		}
		return;
	}

	const googleAiApiKey = requireEnv("GOOGLE_AI_API_KEY");
	const xaiApiKey = requireEnv("XAI_API_KEY");

	const run = await runExperiment({
		conditions,
		prompts,
		dispatch,
		config: {
			googleAiApiKey,
			xaiApiKey,
			geminiModel: "gemini-2.5-flash",
			grokModel: "grok-3-mini",
		},
		onProgress: (msg) => console.log(msg),
	});

	const outPath = join(RESULTS_DIR, `run-${dateTag()}.json`);
	writeFileSync(outPath, JSON.stringify(run, null, 2));
	console.log(`Results saved: ${outPath}`);
	console.log(
		`Total responses: ${run.responses.length}/${prompts.length * conditions.length}`,
	);
	console.log("Done.");
}

const isDirectRun =
	process.argv[1] &&
	import.meta.url.endsWith(process.argv[1].replace(/.*\//, ""));

if (isDirectRun) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
