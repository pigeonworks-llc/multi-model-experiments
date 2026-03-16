#!/usr/bin/env node

import { join } from "node:path";
import { compareSearch } from "../application/compare-search.js";
import { QUERIES } from "../domain/queries.js";
import { callGeminiGrounded } from "../infrastructure/clients/gemini-grounded.js";
import { callGrokSearch } from "../infrastructure/clients/grok-search.js";
import { loadConfig } from "../infrastructure/config.js";
import { saveComparisonRun } from "../infrastructure/persistence.js";

export interface CliOptions {
	prod: boolean;
	dryRun: boolean;
	queryFilter?: string;
	categoryFilter?: string;
}

export function parseArgs(args: string[]): CliOptions {
	const opts: CliOptions = {
		prod: false,
		dryRun: false,
	};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--prod":
				opts.prod = true;
				break;
			case "--dry-run":
				opts.dryRun = true;
				break;
			case "--query":
				opts.queryFilter = args[++i];
				break;
			case "--category":
				opts.categoryFilter = args[++i];
				break;
		}
	}

	return opts;
}

const RESULTS_DIR = join(
	import.meta.dirname ?? new URL(".", import.meta.url).pathname,
	"..",
	"..",
	"results",
);

async function main(): Promise<void> {
	const opts = parseArgs(process.argv.slice(2));
	const config = loadConfig(opts.prod);

	let queries = [...QUERIES];

	if (opts.queryFilter) {
		queries = queries.filter((q) => q.id === opts.queryFilter);
		if (queries.length === 0) {
			console.error(`No query found with id: ${opts.queryFilter}`);
			process.exit(1);
		}
	}

	if (opts.categoryFilter) {
		queries = queries.filter((q) => q.category === opts.categoryFilter);
		if (queries.length === 0) {
			console.error(
				`No queries found for category: ${opts.categoryFilter}`,
			);
			process.exit(1);
		}
	}

	console.log(
		`Comparing ${queries.length} queries: Grok (${config.grokModel}) vs Gemini (${config.geminiModel})${opts.dryRun ? " (dry run)" : ""}`,
	);

	if (opts.dryRun) {
		for (const query of queries) {
			console.log(
				`  ${query.id} [${query.category}]: ${query.text.slice(0, 70)}...`,
			);
		}
		return;
	}

	const run = await compareSearch({
		queries,
		grokCallFn: callGrokSearch,
		geminiCallFn: callGeminiGrounded,
		grokApiKey: config.xaiApiKey,
		geminiApiKey: config.googleAiApiKey,
		grokModel: config.grokModel,
		geminiModel: config.geminiModel,
		onProgress: (msg) => console.log(msg),
	});

	const filePath = saveComparisonRun(RESULTS_DIR, run);
	console.log(`Results saved: ${filePath}`);

	// Summary
	console.log(`\nSummary: ${run.results.length} queries compared`);
	for (const result of run.results) {
		console.log(`  ${result.queryId}:`);
		console.log(`    Grok: ${result.grok.latencyMs}ms`);
		console.log(`    Gemini: ${result.gemini.latencyMs}ms`);
	}

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
