import { randomUUID } from "node:crypto";
import type {
	Condition,
	ExperimentRun,
	ModelResponse,
	PromptItem,
} from "./types.js";

export type ConditionCallFn = (
	prompt: string,
	config: { apiKey: string; model: string },
) => Promise<{
	response: string;
	groundingMetadata?: unknown;
	latencyMs: number;
}>;

export interface RunConfig {
	googleAiApiKey: string;
	xaiApiKey: string;
	geminiModel: string;
	grokModel: string;
}

export interface RunOptions {
	conditions: Condition[];
	prompts: PromptItem[];
	dispatch: Record<Condition, ConditionCallFn>;
	config: RunConfig;
	onProgress?: (message: string) => void;
}

function getApiKey(config: RunConfig, condition: Condition): string {
	switch (condition) {
		case "gemini-grounded":
		case "gemini-plain":
			return config.googleAiApiKey;
		case "grok":
			return config.xaiApiKey;
	}
}

function getModel(config: RunConfig, condition: Condition): string {
	switch (condition) {
		case "gemini-grounded":
		case "gemini-plain":
			return config.geminiModel;
		case "grok":
			return config.grokModel;
	}
}

export async function runExperiment(
	options: RunOptions,
): Promise<ExperimentRun> {
	const { conditions, prompts, dispatch, config, onProgress } = options;
	const runId = randomUUID();
	const responses: ModelResponse[] = [];
	const total = prompts.length * conditions.length;
	let completed = 0;

	const errors: Array<{
		promptId: string;
		condition: Condition;
		error: string;
	}> = [];

	for (const prompt of prompts) {
		for (const condition of conditions) {
			const callFn = dispatch[condition];
			const apiKey = getApiKey(config, condition);
			const model = getModel(config, condition);

			try {
				const result = await callFn(prompt.text, { apiKey, model });

				responses.push({
					promptId: prompt.id,
					condition,
					model,
					response: result.response,
					groundingMetadata: result.groundingMetadata,
					latencyMs: result.latencyMs,
					timestamp: new Date().toISOString(),
				});
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				errors.push({
					promptId: prompt.id,
					condition,
					error: message,
				});
				onProgress?.(
					`[SKIP] ${condition} x ${prompt.id}: ${message.slice(0, 80)}`,
				);
			}

			completed++;
			onProgress?.(`[${completed}/${total}] ${condition} x ${prompt.id}`);
		}
	}

	if (errors.length > 0) {
		onProgress?.(
			`\nCompleted with ${errors.length} errors out of ${total} calls`,
		);
	}

	return {
		runId,
		timestamp: new Date().toISOString(),
		conditions,
		prompts,
		responses,
	};
}
