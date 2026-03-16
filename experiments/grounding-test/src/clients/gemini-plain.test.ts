import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
		getGenerativeModel: vi.fn().mockReturnValue({
			generateContent: mockGenerateContent,
		}),
	})),
}));

import { callGeminiPlain } from "./gemini-plain.js";

describe("callGeminiPlain", () => {
	beforeEach(() => {
		mockGenerateContent.mockReset();
	});

	it("returns response with latency", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "Plain Gemini response.",
				usageMetadata: {
					promptTokenCount: 12,
					candidatesTokenCount: 30,
				},
			},
		});

		const result = await callGeminiPlain("test prompt", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.response).toBe("Plain Gemini response.");
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
	});

	it("does not include grounding metadata", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "response",
				usageMetadata: {
					promptTokenCount: 10,
					candidatesTokenCount: 20,
				},
			},
		});

		const result = await callGeminiPlain("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.groundingMetadata).toBeUndefined();
	});

	it("handles missing usage metadata", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "response",
				usageMetadata: undefined,
			},
		});

		const result = await callGeminiPlain("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.response).toBe("response");
	});

	it("retries on rate limit error", async () => {
		const error = new Error("rate limit");
		Object.assign(error, { status: 429 });
		mockGenerateContent.mockRejectedValueOnce(error).mockResolvedValueOnce({
			response: {
				text: () => "ok",
				usageMetadata: {
					promptTokenCount: 5,
					candidatesTokenCount: 10,
				},
			},
		});

		const result = await callGeminiPlain("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.response).toBe("ok");
		expect(mockGenerateContent).toHaveBeenCalledTimes(2);
	});
});
