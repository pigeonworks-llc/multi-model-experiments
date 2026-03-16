import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn().mockReturnValue({
	generateContent: mockGenerateContent,
});

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
		getGenerativeModel: mockGetGenerativeModel,
	})),
}));

import { callGeminiGrounded } from "./gemini-grounded.js";

describe("callGeminiGrounded", () => {
	beforeEach(() => {
		mockGenerateContent.mockReset();
		mockGetGenerativeModel.mockClear();
	});

	it("returns response with latency", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "Grounded answer with sources.",
				usageMetadata: {
					promptTokenCount: 15,
					candidatesTokenCount: 40,
				},
				candidates: [
					{
						groundingMetadata: {
							searchEntryPoint: {
								renderedContent: "<html>search</html>",
							},
							groundingChunks: [
								{
									web: {
										uri: "https://example.com",
										title: "Source",
									},
								},
							],
						},
					},
				],
			},
		});

		const result = await callGeminiGrounded("test prompt", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.response).toBe("Grounded answer with sources.");
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
	});

	it("captures grounding metadata from response", async () => {
		const groundingMeta = {
			searchEntryPoint: { renderedContent: "<html>" },
			groundingChunks: [{ web: { uri: "https://example.com", title: "Test" } }],
			groundingSupports: [
				{
					segment: { startIndex: 0, endIndex: 10, text: "test" },
					groundingChunkIndices: [0],
					confidenceScores: [0.9],
				},
			],
		};

		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "response",
				usageMetadata: {
					promptTokenCount: 10,
					candidatesTokenCount: 20,
				},
				candidates: [{ groundingMetadata: groundingMeta }],
			},
		});

		const result = await callGeminiGrounded("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.groundingMetadata).toEqual(groundingMeta);
	});

	it("handles missing grounding metadata", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "response without grounding",
				usageMetadata: {
					promptTokenCount: 10,
					candidatesTokenCount: 20,
				},
				candidates: [{}],
			},
		});

		const result = await callGeminiGrounded("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.groundingMetadata).toBeUndefined();
	});

	it("handles empty candidates array", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "response",
				usageMetadata: {
					promptTokenCount: 10,
					candidatesTokenCount: 20,
				},
				candidates: [],
			},
		});

		const result = await callGeminiGrounded("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.groundingMetadata).toBeUndefined();
	});

	it("passes google search retrieval tool to model", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "ok",
				usageMetadata: {
					promptTokenCount: 5,
					candidatesTokenCount: 10,
				},
				candidates: [{}],
			},
		});

		await callGeminiGrounded("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(mockGetGenerativeModel).toHaveBeenCalledWith({
			model: "gemini-2.5-flash",
			tools: [
				{
					googleSearchRetrieval: {
						dynamicRetrievalConfig: {
							mode: "MODE_DYNAMIC",
							dynamicThreshold: 0.3,
						},
					},
				},
			],
		});
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
				candidates: [{}],
			},
		});

		const result = await callGeminiGrounded("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.response).toBe("ok");
		expect(mockGenerateContent).toHaveBeenCalledTimes(2);
	});
});
