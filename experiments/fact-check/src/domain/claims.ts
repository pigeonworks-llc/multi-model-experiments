import type { Claim } from "./types.js";

export const CLAIMS: Claim[] = [
	// --- historical (3) ---
	{
		id: "hist-01",
		category: "historical",
		text: "The Great Wall of China is visible from space with the naked eye.",
		expectedVerdict: "false",
	},
	{
		id: "hist-02",
		category: "historical",
		text: "Napoleon Bonaparte was unusually short for his time.",
		expectedVerdict: "false",
	},
	{
		id: "hist-03",
		category: "historical",
		text: "The Apollo 11 mission landed on the Moon on July 20, 1969.",
		expectedVerdict: "true",
	},

	// --- scientific (3) ---
	{
		id: "sci-01",
		category: "scientific",
		text: "Humans use only 10% of their brain capacity.",
		expectedVerdict: "false",
	},
	{
		id: "sci-02",
		category: "scientific",
		text: "Water molecules consist of two hydrogen atoms and one oxygen atom.",
		expectedVerdict: "true",
	},
	{
		id: "sci-03",
		category: "scientific",
		text: "Lightning never strikes the same place twice.",
		expectedVerdict: "false",
	},

	// --- statistical (2) ---
	{
		id: "stat-01",
		category: "statistical",
		text: "The global average temperature has increased by approximately 1.1 degrees Celsius since the pre-industrial era.",
		expectedVerdict: "true",
	},
	{
		id: "stat-02",
		category: "statistical",
		text: "More than 50% of the world's population lives in cities as of 2023.",
		expectedVerdict: "true",
	},

	// --- current-event (2) ---
	{
		id: "cur-01",
		category: "current-event",
		text: "GPT-4 was released by OpenAI in March 2023.",
		expectedVerdict: "true",
	},
	{
		id: "cur-02",
		category: "current-event",
		text: "The James Webb Space Telescope was launched in December 2021.",
		expectedVerdict: "true",
	},

	// --- technical (2) ---
	{
		id: "tech-01",
		category: "technical",
		text: "TypeScript is a superset of JavaScript that adds static type checking.",
		expectedVerdict: "true",
	},
	{
		id: "tech-02",
		category: "technical",
		text: "Python 2 reached end of life on January 1, 2020.",
		expectedVerdict: "true",
	},
];

export function buildVerificationPrompt(claimText: string): string {
	return `Verify this claim using web search. Determine if the claim is true, false, partially true, or unverifiable.

Claim: "${claimText}"

Respond with a JSON object containing:
- "verdict": one of "true", "false", "partially-true", "unverifiable"
- "confidence": one of "high", "medium", "low"
- "explanation": a concise explanation of your verdict (2-3 sentences)
- "sources": array of objects with "title", "url", "snippet" for each source used

Respond ONLY with the JSON object, no markdown fencing.`;
}
