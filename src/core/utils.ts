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
	return value
		.trim() // Trim leading and trailing whitespace
		.toLowerCase() // Convert to lowercase
		.replace(/^@/, "") // Remove leading '@' from npm scopes
		.replace(/.*\//, "") // Extract the basename by removing everything up to the last '/'
		.replace(/[^a-z0-9._-]+/g, "-") // Replace invalid characters with '-'
		.replace(/^-+|-+$/g, ""); // Trim leading and trailing dashes
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
