#!/usr/bin/env node

import { join } from "node:path";
import { verifyClaims } from "../application/verify-claims.js";
import { CLAIMS } from "../domain/claims.js";
import { callGrokSearch } from "../infrastructure/clients/grok.js";
import { loadConfig } from "../infrastructure/config.js";
import { saveVerificationRun } from "../infrastructure/persistence.js";

export interface CliOptions {
	prod: boolean;
	dryRun: boolean;
	claimFilter?: string;
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
			case "--claim":
				opts.claimFilter = args[++i];
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

	let claims = [...CLAIMS];

	if (opts.claimFilter) {
		claims = claims.filter((c) => c.id === opts.claimFilter);
		if (claims.length === 0) {
			console.error(`No claim found with id: ${opts.claimFilter}`);
			process.exit(1);
		}
	}

	if (opts.categoryFilter) {
		claims = claims.filter((c) => c.category === opts.categoryFilter);
		if (claims.length === 0) {
			console.error(
				`No claims found for category: ${opts.categoryFilter}`,
			);
			process.exit(1);
		}
	}

	console.log(
		`Verifying ${claims.length} claims with ${config.model}${opts.dryRun ? " (dry run)" : ""}`,
	);

	if (opts.dryRun) {
		for (const claim of claims) {
			console.log(
				`  ${claim.id} [${claim.category}]: ${claim.text.slice(0, 70)}...`,
			);
		}
		return;
	}

	const run = await verifyClaims({
		claims,
		callFn: callGrokSearch,
		apiKey: config.xaiApiKey,
		model: config.model,
		onProgress: (msg) => console.log(msg),
	});

	const filePath = saveVerificationRun(RESULTS_DIR, run);
	console.log(`Results saved: ${filePath}`);

	// Summary
	const correct = run.results.filter(
		(r, i) => r.verdict === run.claims[i].expectedVerdict,
	).length;
	console.log(
		`\nAccuracy: ${correct}/${run.results.length} matched expected verdict`,
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
