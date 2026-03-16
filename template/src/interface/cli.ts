#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { callClaude } from "../infrastructure/clients/claude.js";
import { callGemini } from "../infrastructure/clients/gemini.js";
import { callGrok } from "../infrastructure/clients/grok.js";
import { getApiKey, loadConfig } from "../infrastructure/config.js";
import { PROMPTS } from "../domain/prompts.js";
import { runExperiment } from "../application/run-experiment.js";
import type { CallFn, ModelProvider } from "../domain/types.js";

const RESULTS_DIR = join(
	import.meta.dirname ?? new URL(".", import.meta.url).pathname,
	"..",
	"..",
	"results",
);

function dateTag(): string {
	return new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const dryRun = args.includes("--dry-run");
	const config = loadConfig();

	const dispatch: Record<ModelProvider, CallFn> = {
		claude: callClaude,
		gemini: callGemini,
		grok: callGrok,
	};

	console.log(`Running ${PROMPTS.length} prompts x ${config.models.length} models${dryRun ? " (dry run)" : ""}`);

	if (dryRun) {
		for (const p of PROMPTS) {
			for (const m of config.models) {
				console.log(`  ${m.provider} x ${p.id}: ${p.text.slice(0, 60)}...`);
			}
		}
		return;
	}

	const apiKeys: Record<ModelProvider, string> = {
		claude: getApiKey(config, "claude"),
		gemini: getApiKey(config, "gemini"),
		grok: getApiKey(config, "grok"),
	};

	const run = await runExperiment({
		prompts: PROMPTS,
		dispatch,
		apiKeys,
		models: config.models,
		onProgress: (msg) => console.log(msg),
	});

	const path = join(RESULTS_DIR, `results-${dateTag()}.json`);
	writeFileSync(path, JSON.stringify(run, null, 2));
	console.log(`Results saved: ${path}`);
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
