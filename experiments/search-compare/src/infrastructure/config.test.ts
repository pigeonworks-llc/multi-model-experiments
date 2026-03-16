import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("config", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = {
			...originalEnv,
			XAI_API_KEY: "xai-test",
			GOOGLE_AI_API_KEY: "ai-test",
		};
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("loadConfig", () => {
		it("loads dev models by default", () => {
			const config = loadConfig();
			expect(config.xaiApiKey).toBe("xai-test");
			expect(config.googleAiApiKey).toBe("ai-test");
			expect(config.grokModel).toBe("grok-4-1-fast");
			expect(config.geminiModel).toContain("flash");
		});

		it("loads prod models when prod=true", () => {
			const config = loadConfig(true);
			expect(config.grokModel).toBe("grok-4-1-fast");
			expect(config.geminiModel).toBe("gemini-2.5-pro");
		});

		it("throws when XAI_API_KEY is missing", () => {
			delete process.env.XAI_API_KEY;
			expect(() => loadConfig()).toThrow("XAI_API_KEY");
		});

		it("throws when GOOGLE_AI_API_KEY is missing", () => {
			delete process.env.GOOGLE_AI_API_KEY;
			expect(() => loadConfig()).toThrow("GOOGLE_AI_API_KEY");
		});
	});
});
