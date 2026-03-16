import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ComparisonRun } from "../domain/types.js";

function ensureDir(filePath: string): void {
	mkdirSync(dirname(filePath), { recursive: true });
}

export function dateTag(): string {
	return new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
}

export function saveComparisonRun(
	resultsDir: string,
	run: ComparisonRun,
): string {
	const filePath = join(resultsDir, `search-compare-${dateTag()}.json`);
	ensureDir(filePath);
	writeFileSync(filePath, JSON.stringify(run, null, 2));
	return filePath;
}

export function loadJsonFile<T>(filePath: string): T {
	const content = readFileSync(filePath, "utf-8");
	return JSON.parse(content) as T;
}
