import { config as loadEnv } from "dotenv";

loadEnv();

export interface AppConfig {
	xaiApiKey: string;
	model: string;
}

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable: ${name}`);
	}
	return value;
}

export function loadConfig(prod = false): AppConfig {
	return {
		xaiApiKey: requireEnv("XAI_API_KEY"),
		model: "grok-4-1-fast",  // web_search requires grok-4 series
	};
}
