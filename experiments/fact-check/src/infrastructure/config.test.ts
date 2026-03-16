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
		it("loads dev model by default", () => {
			const config = loadConfig();
			expect(config.xaiApiKey).toBe("xai-test");
			expect(config.model).toBe("grok-4-1-fast");
		});

		it("loads prod model when prod=true", () => {
			const config = loadConfig(true);
			expect(config.model).toBe("grok-4-1-fast");
		});

		it("throws when XAI_API_KEY is missing", () => {
			delete process.env.XAI_API_KEY;
			expect(() => loadConfig()).toThrow("XAI_API_KEY");
		});
	});
});
