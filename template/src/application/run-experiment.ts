import { randomUUID } from "node:crypto";
import type {
	CallFn,
	ExperimentRun,
	ModelProvider,
	ModelResponse,
	PromptItem,
} from "../domain/types.js";

export interface RunOptions {
	prompts: PromptItem[];
	dispatch: Record<ModelProvider, CallFn>;
	apiKeys: Record<ModelProvider, string>;
	models: Array<{ provider: ModelProvider; modelId: string }>;
	onProgress?: (message: string) => void;
}

export async function runExperiment(
	options: RunOptions,
): Promise<ExperimentRun> {
	const { prompts, dispatch, apiKeys, models, onProgress } = options;
	const responses: ModelResponse[] = [];
	const total = prompts.length * models.length;
	let completed = 0;

	for (const prompt of prompts) {
		for (const model of models) {
			try {
				const result = await dispatch[model.provider](prompt.text, {
					apiKey: apiKeys[model.provider],
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
				const message = err instanceof Error ? err.message : String(err);
				onProgress?.(`[SKIP] ${model.provider} x ${prompt.id}: ${message.slice(0, 80)}`);
			}
			completed++;
			onProgress?.(`[${completed}/${total}] ${model.provider} x ${prompt.id}`);
		}
	}

	return {
		runId: randomUUID(),
		timestamp: new Date().toISOString(),
		responses,
	};
}
