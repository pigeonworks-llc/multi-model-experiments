import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("@google/generative-ai", () => ({
	GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
		getGenerativeModel: vi.fn().mockReturnValue({
			generateContent: mockGenerateContent,
		}),
	})),
}));

import { callGeminiGrounded } from "./gemini-grounded.js";

describe("callGeminiGrounded", () => {
	beforeEach(() => {
		mockGenerateContent.mockReset();
	});

	it("returns response with grounding metadata", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "Grounded answer.",
				candidates: [
					{
						groundingMetadata: {
							webSearchQueries: ["test query"],
						},
					},
				],
			},
		});

		const result = await callGeminiGrounded("test query", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.response).toBe("Grounded answer.");
		expect(result.latencyMs).toBeGreaterThanOrEqual(0);
	});

	it("handles missing grounding metadata", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "Plain answer.",
				candidates: [{}],
			},
		});

		const result = await callGeminiGrounded("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.response).toBe("Plain answer.");
		expect(result.sources).toEqual([]);
	});

	it("handles empty candidates", async () => {
		mockGenerateContent.mockResolvedValueOnce({
			response: {
				text: () => "Answer.",
				candidates: [],
			},
		});

		const result = await callGeminiGrounded("test", {
			apiKey: "ai-test",
			model: "gemini-2.5-flash",
		});

		expect(result.response).toBe("Answer.");
	});

	it("retries on failure", async () => {
		mockGenerateContent
			.mockRejectedValueOnce(new Error("rate limit"))
			.mockResolvedValueOnce({
				response: {
					text: () => "ok",
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
