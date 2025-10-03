import { stripAnsi } from "consola/utils";

/**
 * Capitalizes the first letter of the input string.
 * @param string - The input string to capitalize.
 * @returns The string with the first character converted to uppercase.
 */
export function capitalizeFirstLetter(string: string) {
	return string[0].toUpperCase() + string.slice(1);
}

/**
 * Convert an arbitrary string into a URL and npm-friendly slug.
 * @param value - The input string to slugify (e.g., package or repo name).
 * @returns A normalized slug suitable for package/repo names.
 */
export function toSlug(value: string): string {
	// Normalize case/whitespace and extract last path-like segment (supports URLs and Windows paths)
	const normalized = value.trim().toLowerCase();
	const segments = normalized.split(/[\\/]+/).filter(Boolean);
	let base = segments.length ? segments[segments.length - 1] : normalized;

	// Handle npm scopes like "@scope/name" (base will typically be "name", but keep safe)
	base = base.replace(/^@/, "");

	// Strip common VCS suffix if present
	base = base.replace(/\.git$/, "");

	// Replace invalid characters with a hyphen
	base = base.replace(/[^a-z0-9._-]+/g, "-");

	// Collapse multiple hyphens
	base = base.replace(/-+/g, "-");

	// Trim leading and trailing hyphens
	base = base.replace(/^-+|-+$/g, "");

	return base;
}

/**
 * Sleep for the specified number of milliseconds.
 * @param ms - The number of milliseconds to sleep.
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate a string to a maximum visible length, respecting ANSI sequences.
 * If truncated, appends "...". ANSI styling is not preserved in the truncated section.
 * @param s - The input string to truncate.
 * @param max - The maximum visible length.
 */
export function truncate(s: string, max: number): string {
	const raw = stripAnsi(s);
	if (raw.length <= max) return s;
	return `${raw.slice(0, Math.max(0, max - 3))}...`;
}
