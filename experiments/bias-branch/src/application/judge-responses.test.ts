import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractJson, isJudgeResult, makeFallback } from "./judge-responses.js";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
	default: vi.fn().mockImplementation(() => ({
		messages: { create: mockCreate },
	})),
}));

import { judgeResponse } from "./judge-responses.js";

describe("judge-responses", () => {
	describe("isJudgeResult", () => {
		it("returns true for valid judge result", () => {
			expect(
				isJudgeResult({
					stance: "nuanced",
					confidence: "high",
					keyThemes: ["safety"],
					summary: "A balanced view.",
				}),
			).toBe(true);
		});

		it("returns false for invalid stance", () => {
			expect(
				isJudgeResult({
					stance: "invalid",
					confidence: "high",
					keyThemes: [],
					summary: "test",
				}),
			).toBe(false);
		});

		it("returns false for non-object", () => {
			expect(isJudgeResult("string")).toBe(false);
			expect(isJudgeResult(null)).toBe(false);
		});

		it("returns false for missing fields", () => {
			expect(isJudgeResult({ stance: "agree" })).toBe(false);
		});
	});

	describe("extractJson", () => {
		it("extracts JSON from code block", () => {
			const input = '```json\n{"key": "value"}\n```';
			expect(extractJson(input)).toBe('{"key": "value"}');
		});

		it("returns trimmed text when no code block", () => {
			const input = '  {"key": "value"}  ';
			expect(extractJson(input)).toBe('{"key": "value"}');
		});
	});

	describe("makeFallback", () => {
		it("returns nuanced/low fallback with truncated message", () => {
			const result = makeFallback("some raw text");
			expect(result.stance).toBe("nuanced");
			expect(result.confidence).toBe("low");
			expect(result.keyThemes).toEqual([]);
			expect(result.summary).toContain("parse");
		});
	});

	describe("judgeResponse", () => {
		beforeEach(() => {
			mockCreate.mockReset();
		});

		it("parses structured judge response", async () => {
			mockCreate.mockResolvedValueOnce({
				content: [
					{
						type: "text",
						text: JSON.stringify({
							stance: "nuanced",
							confidence: "high",
							keyThemes: ["safety", "capability"],
							summary: "Balanced perspective on AI safety.",
						}),
					},
				],
				usage: { input_tokens: 100, output_tokens: 50 },
			});

			const result = await judgeResponse({
				promptText: "Is AI safe?",
				responseText: "It depends on implementation.",
				apiKey: "sk-test",
				model: "claude-haiku-4-5-20251001",
			});

			expect(result.stance).toBe("nuanced");
			expect(result.confidence).toBe("high");
			expect(result.keyThemes).toEqual(["safety", "capability"]);
			expect(result.summary).toBe("Balanced perspective on AI safety.");
		});

		it("handles JSON wrapped in markdown code block", async () => {
			mockCreate.mockResolvedValueOnce({
				content: [
					{
						type: "text",
						text: '```json\n{"stance":"agree","confidence":"medium","keyThemes":["progress"],"summary":"Agrees."}\n```',
					},
				],
				usage: { input_tokens: 50, output_tokens: 30 },
			});

			const result = await judgeResponse({
				promptText: "question",
				responseText: "answer",
				apiKey: "sk-test",
				model: "claude-haiku-4-5-20251001",
			});

			expect(result.stance).toBe("agree");
		});

		it("returns fallback on invalid JSON", async () => {
			mockCreate.mockResolvedValueOnce({
				content: [{ type: "text", text: "not valid json at all" }],
				usage: { input_tokens: 50, output_tokens: 30 },
			});

			const result = await judgeResponse({
				promptText: "question",
				responseText: "answer",
				apiKey: "sk-test",
				model: "claude-haiku-4-5-20251001",
			});

			expect(result.stance).toBe("nuanced");
			expect(result.confidence).toBe("low");
			expect(result.summary).toContain("parse");
		});
	});
});
