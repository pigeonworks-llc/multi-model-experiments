import { config as loadEnv } from "dotenv";

loadEnv();

export interface AppConfig {
	xaiApiKey: string;
	googleAiApiKey: string;
	grokModel: string;
	geminiModel: string;
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
		googleAiApiKey: requireEnv("GOOGLE_AI_API_KEY"),
		grokModel: "grok-4-1-fast",  // web_search requires grok-4 series
		geminiModel: prod ? "gemini-2.5-pro" : "gemini-2.5-flash",
	};
}
