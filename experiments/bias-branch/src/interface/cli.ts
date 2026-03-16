#!/usr/bin/env node

import { join } from "node:path";
import { judgeResponse } from "../application/judge-responses.js";
import { runExperiment } from "../application/run-experiment.js";
import { PROMPTS } from "../domain/prompts.js";
import type {
	CallFn,
	JudgedExperimentRun,
	JudgedResponse,
	ModelProvider,
} from "../domain/types.js";
import { callClaude } from "../infrastructure/clients/claude.js";
import { callGemini } from "../infrastructure/clients/gemini.js";
import { callGrok } from "../infrastructure/clients/grok.js";
import { getApiKey, loadConfig } from "../infrastructure/config.js";
import {
	saveJudgedResults,
	saveRawResults,
} from "../infrastructure/persistence.js";

export interface CliOptions {
	prod: boolean;
	judge: boolean;
	dryRun: boolean;
	promptFilter?: string;
	modelFilter?: string;
}

export function parseArgs(args: string[]): CliOptions {
	const opts: CliOptions = {
		prod: false,
		judge: false,
		dryRun: false,
	};

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--prod":
				opts.prod = true;
				break;
			case "--judge":
				opts.judge = true;
				break;
			case "--dry-run":
				opts.dryRun = true;
				break;
			case "--prompt":
				opts.promptFilter = args[++i];
				break;
			case "--model":
				opts.modelFilter = args[++i];
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

	const dispatch: Record<ModelProvider, CallFn> = {
		claude: callClaude,
		gemini: callGemini,
		grok: callGrok,
	};

	let prompts = [...PROMPTS];
	let models = [...config.models];

	if (opts.promptFilter) {
		prompts = prompts.filter((p) => p.id === opts.promptFilter);
		if (prompts.length === 0) {
			console.error(`No prompt found with id: ${opts.promptFilter}`);
			process.exit(1);
		}
	}

	if (opts.modelFilter) {
		models = models.filter((m) => m.provider === opts.modelFilter);
		if (models.length === 0) {
			console.error(`No model found for provider: ${opts.modelFilter}`);
			process.exit(1);
		}
	}

	console.log(
		`Running ${prompts.length} prompts x ${models.length} models${opts.dryRun ? " (dry run)" : ""}`,
	);

	if (opts.dryRun) {
		for (const p of prompts) {
			for (const m of models) {
				console.log(
					`  ${m.displayName} x ${p.id}: ${p.text.slice(0, 60)}...`,
				);
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
		models,
		prompts,
		dispatch,
		apiKeys,
		onProgress: (msg) => console.log(msg),
	});

	const rawPath = saveRawResults(RESULTS_DIR, run);
	console.log(`Raw results saved: ${rawPath}`);

	if (opts.judge) {
		console.log("Running judge phase...");
		const judgeModel = config.models.find(
			(m) => m.provider === "claude",
		)?.modelId;
		if (!judgeModel) {
			console.error("Claude model required for judge phase");
			process.exit(1);
		}

		const judgedResponses: JudgedResponse[] = [];
		for (let i = 0; i < run.responses.length; i++) {
			const resp = run.responses[i];
			const prompt = prompts.find((p) => p.id === resp.promptId);
			console.log(
				`  Judging [${i + 1}/${run.responses.length}] ${resp.provider} x ${resp.promptId}`,
			);

			const judgeResult = await judgeResponse({
				promptText: prompt?.text ?? "",
				responseText: resp.response,
				apiKey: apiKeys.claude,
				model: judgeModel,
			});

			judgedResponses.push({ ...resp, judge: judgeResult });
		}

		const judgedRun: JudgedExperimentRun = {
			...run,
			responses: judgedResponses,
			judgeModel,
		};

		const judgedPath = saveJudgedResults(RESULTS_DIR, judgedRun);
		console.log(`Judged results saved: ${judgedPath}`);
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
