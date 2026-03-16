import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
		getGenerativeModel: vi.fn().mockReturnValue({
			generateContent: mockGenerateContent,
		}),
	})),
}));

import { callGemini } from "./gemini.js";

describe("callGemini", () => {
	beforeEach(() => {
		mockGenerateContent.mockReset();
	});

	it("returns response with usage and latency", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "Gemini thinks this is nuanced.",
				usageMetadata: {
					promptTokenCount: 12,
					candidatesTokenCount: 30,
				},
			},
		});

		const result = await callGemini("test prompt", {
			apiKey: "ai-test",
			model: "gemini-2.0-flash",
		});

		expect(result.response).toBe("Gemini thinks this is nuanced.");
		expect(result.usage).toEqual({ input: 12, output: 30 });
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
	});

	it("handles missing usage metadata", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "response",
				usageMetadata: undefined,
			},
		});

		const result = await callGemini("test", {
			apiKey: "ai-test",
			model: "gemini-2.0-flash",
		});

		expect(result.usage).toEqual({ input: 0, output: 0 });
	});

	it("retries on rate limit error", async () => {
		const error = new Error("rate limit");
		Object.assign(error, { status: 429 });
		mockGenerateContent
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce({
				response: {
					text: () => "ok",
					usageMetadata: {
						promptTokenCount: 5,
						candidatesTokenCount: 10,
					},
				},
			});

		const result = await callGemini("test", {
			apiKey: "ai-test",
			model: "gemini-2.0-flash",
		});

		expect(result.response).toBe("ok");
		expect(mockGenerateContent).toHaveBeenCalledTimes(2);
	});
});
