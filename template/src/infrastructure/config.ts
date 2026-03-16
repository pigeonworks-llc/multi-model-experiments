import { config as loadEnv } from "dotenv";
import type { ModelConfig, ModelProvider } from "../domain/types.js";

loadEnv();

export interface AppConfig {
	anthropicApiKey: string;
	googleAiApiKey: string;
	xaiApiKey: string;
	models: ModelConfig[];
}

const DEV_MODELS: ModelConfig[] = [
	{
		provider: "claude",
		modelId: "claude-haiku-4-5-20251001",
		displayName: "Claude Haiku 4.5",
	},
	{
		provider: "gemini",
		modelId: "gemini-2.5-flash",
		displayName: "Gemini 2.5 Flash",
	},
	{
		provider: "grok",
		modelId: "grok-3-mini",
		displayName: "Grok 3 Mini",
	},
];

const PROD_MODELS: ModelConfig[] = [
	{
		provider: "claude",
		modelId: "claude-sonnet-4-20250514",
		displayName: "Claude Sonnet 4",
	},
	{
		provider: "gemini",
		modelId: "gemini-2.5-pro",
		displayName: "Gemini 2.5 Pro",
	},
	{
		provider: "grok",
		modelId: "grok-3",
		displayName: "Grok 3",
	},
];

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable: ${name}`);
	}
	return value;
}

export function loadConfig(prod = false): AppConfig {
	return {
		anthropicApiKey: requireEnv("ANTHROPIC_API_KEY"),
		googleAiApiKey: requireEnv("GOOGLE_AI_API_KEY"),
		xaiApiKey: requireEnv("XAI_API_KEY"),
		models: prod ? PROD_MODELS : DEV_MODELS,
	};
}

export function getApiKey(
	config: AppConfig,
	provider: ModelProvider,
): string {
	switch (provider) {
		case "claude":
			return config.anthropicApiKey;
		case "gemini":
			return config.googleAiApiKey;
		case "grok":
			return config.xaiApiKey;
	}
}
