import validatePkg from "validate-npm-package-name";

/**
 * Validates a library name to ensure it conforms to NPM package name rules.
 * @param name - The library/package name to validate.
 * @returns true if the name is valid for new packages; otherwise an error string.
 */
export function validatePackageName(name: string): true | string {
	const res = validatePkg(name);
	if (res.validForNewPackages) return true;

	const errors = [...(res.errors || []), ...(res.warnings || [])].join(", ");
	return `Invalid library name: ${errors}`;
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
 * Sorts the keys of an object alphabetically and returns a new object with the sorted keys.
 * The order of values remains the same as in the original object.
 * @param obj - The input object whose keys should be sorted.
 * @returns A new object with the same key-value pairs but with keys in alphabetical order.
 */
export function sortKeys<T extends Record<string, unknown>>(obj: T): T {
	return Object.keys(obj)
		.sort()
		.reduce((acc, k) => {
			(acc as Record<string, unknown>)[k] = obj[k];
			return acc;
		}, {} as T);
}
