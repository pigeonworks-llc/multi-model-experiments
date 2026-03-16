import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getApiKey, loadConfig } from "./config.js";

describe("config", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = {
			...originalEnv,
			ANTHROPIC_API_KEY: "sk-ant-test",
			GOOGLE_AI_API_KEY: "ai-test",
			XAI_API_KEY: "xai-test",
		};
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("loadConfig", () => {
		it("loads dev models by default", () => {
			const config = loadConfig();
			expect(config.anthropicApiKey).toBe("sk-ant-test");
			expect(config.googleAiApiKey).toBe("ai-test");
			expect(config.xaiApiKey).toBe("xai-test");
			expect(config.models).toHaveLength(3);
			expect(config.models[0].modelId).toContain("haiku");
		});

		it("loads prod models when prod=true", () => {
			const config = loadConfig(true);
			expect(config.models).toHaveLength(3);
			expect(config.models[0].modelId).toContain("sonnet");
		});

		it("throws when ANTHROPIC_API_KEY is missing", () => {
			delete process.env.ANTHROPIC_API_KEY;
			expect(() => loadConfig()).toThrow("ANTHROPIC_API_KEY");
		});

		it("throws when GOOGLE_AI_API_KEY is missing", () => {
			delete process.env.GOOGLE_AI_API_KEY;
			expect(() => loadConfig()).toThrow("GOOGLE_AI_API_KEY");
		});

		it("throws when XAI_API_KEY is missing", () => {
			delete process.env.XAI_API_KEY;
			expect(() => loadConfig()).toThrow("XAI_API_KEY");
		});
	});

	describe("getApiKey", () => {
		it("returns anthropic key for claude", () => {
			const config = loadConfig();
			expect(getApiKey(config, "claude")).toBe("sk-ant-test");
		});

		it("returns google key for gemini", () => {
			const config = loadConfig();
			expect(getApiKey(config, "gemini")).toBe("ai-test");
		});

		it("returns xai key for grok", () => {
			const config = loadConfig();
			expect(getApiKey(config, "grok")).toBe("xai-test");
		});
	});
});
