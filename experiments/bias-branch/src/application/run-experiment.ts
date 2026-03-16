import { randomUUID } from "node:crypto";
import type {
	CallFn,
	ExperimentRun,
	ModelConfig,
	ModelProvider,
	ModelResponse,
	PromptItem,
} from "../domain/types.js";

export interface RunOptions {
	models: ModelConfig[];
	prompts: PromptItem[];
	dispatch: Record<ModelProvider, CallFn>;
	apiKeys: Record<ModelProvider, string>;
	onProgress?: (message: string) => void;
}

export async function runExperiment(
	options: RunOptions,
): Promise<ExperimentRun> {
	const { models, prompts, dispatch, apiKeys, onProgress } = options;
	const runId = randomUUID();
	const responses: ModelResponse[] = [];
	const total = prompts.length * models.length;
	let completed = 0;

	const errors: Array<{
		promptId: string;
		provider: ModelProvider;
		error: string;
	}> = [];

	for (const prompt of prompts) {
		for (const model of models) {
			const callFn = dispatch[model.provider];
			const apiKey = apiKeys[model.provider];

			try {
				const result = await callFn(prompt.text, {
					apiKey,
					model: model.modelId,
				});

				responses.push({
					promptId: prompt.id,
					provider: model.provider,
					modelId: model.modelId,
					response: result.response,
					tokenUsage: result.usage,
					latencyMs: result.latencyMs,
					timestamp: new Date().toISOString(),
				});
			} catch (err) {
				const message =
					err instanceof Error ? err.message : String(err);
				errors.push({
					promptId: prompt.id,
					provider: model.provider,
					error: message,
				});
				onProgress?.(
					`[SKIP] ${model.displayName} x ${prompt.id}: ${message.slice(0, 80)}`,
				);
			}

			completed++;
			onProgress?.(
				`[${completed}/${total}] ${model.displayName} x ${prompt.id}`,
			);
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
		models,
		prompts,
		responses,
	};
}
