import { describe, expect, it } from "vitest";
import { withRetry } from "./retry.js";

describe("withRetry", () => {
	it("returns result on first success", async () => {
		const result = await withRetry(() => Promise.resolve("ok"), 3);
		expect(result).toBe("ok");
	});

	it("retries on failure and succeeds", async () => {
		let attempt = 0;
		const result = await withRetry(() => {
			attempt++;
			if (attempt < 2) throw new Error("fail");
			return Promise.resolve("recovered");
		}, 3);
		expect(result).toBe("recovered");
		expect(attempt).toBe(2);
	});

	it("throws after maxRetries exhausted", async () => {
		let attempt = 0;
		await expect(
			withRetry(
				() => {
					attempt++;
					throw new Error("persistent");
				},
				3,
				1,
			),
		).rejects.toThrow("persistent");
		expect(attempt).toBe(3);
	});

	it("uses exponential backoff", async () => {
		const start = Date.now();
		let attempt = 0;
		await expect(
			withRetry(
				() => {
					attempt++;
					throw new Error("fail");
				},
				2,
				50,
			),
		).rejects.toThrow();
		const elapsed = Date.now() - start;
		// 50ms first retry = ~50ms minimum
		expect(elapsed).toBeGreaterThanOrEqual(40);
	});
});
