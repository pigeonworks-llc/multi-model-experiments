function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	baseDelayMs = 1000,
): Promise<T> {
	let lastError: unknown;
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (attempt < maxRetries - 1) {
				const delay = baseDelayMs * 2 ** attempt;
				await sleep(delay);
			}
		}
	}
	throw lastError;
}
