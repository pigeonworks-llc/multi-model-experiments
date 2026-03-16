import type { QueryItem } from "./types.js";

export const QUERIES: QueryItem[] = [
	// --- factual (3) ---
	{
		id: "fact-01",
		category: "factual",
		text: "What is the current population of Tokyo as of 2024?",
	},
	{
		id: "fact-02",
		category: "factual",
		text: "Who won the Nobel Prize in Physics in 2024?",
	},
	{
		id: "fact-03",
		category: "factual",
		text: "What is the tallest building in the world as of 2025?",
	},

	// --- recent-event (3) ---
	{
		id: "rec-01",
		category: "recent-event",
		text: "What were the major AI model releases in 2025?",
	},
	{
		id: "rec-02",
		category: "recent-event",
		text: "What is the current status of the Artemis moon program?",
	},
	{
		id: "rec-03",
		category: "recent-event",
		text: "What new programming languages gained popularity in 2025?",
	},

	// --- technical (2) ---
	{
		id: "tech-01",
		category: "technical",
		text: "What are the key differences between Bun and Deno as of 2025?",
	},
	{
		id: "tech-02",
		category: "technical",
		text: "What is the latest stable version of Rust and its major features?",
	},

	// --- statistical (2) ---
	{
		id: "stat-01",
		category: "statistical",
		text: "What percentage of global electricity comes from renewable sources as of 2024?",
	},
	{
		id: "stat-02",
		category: "statistical",
		text: "What is the current global smartphone penetration rate?",
	},

	// --- controversial (2) ---
	{
		id: "cont-01",
		category: "controversial",
		text: "Is nuclear fusion energy commercially viable within the next decade?",
	},
	{
		id: "cont-02",
		category: "controversial",
		text: "Are large language models approaching artificial general intelligence?",
	},
];

export function buildSearchPrompt(queryText: string): string {
	return `Answer the following question using web search to find current, accurate information. Include specific facts, numbers, and dates where possible.

Question: ${queryText}

Provide a concise, factual answer based on search results.`;
}
