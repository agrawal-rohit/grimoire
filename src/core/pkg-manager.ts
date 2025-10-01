import { Language } from "../summon/package/config";
import { validateTypescriptPackageName } from "../summon/package/typescript";
import { commandExistsAsync, runAsync } from "./shell";

/** Type representing the possible package managers. */
export type PackageManager =
	(typeof LANGUAGE_PACKAGE_MANAGER)[keyof typeof LANGUAGE_PACKAGE_MANAGER];

/** Type representing the possible package registries. */
export type PackageRegistry =
	(typeof LANGUAGE_PACKAGE_REGISTRY)[keyof typeof LANGUAGE_PACKAGE_REGISTRY];

/** Maps each supported language to its default package manager. */
export const LANGUAGE_PACKAGE_MANAGER = {
	[Language.TYPESCRIPT]: "pnpm",
} as const satisfies Record<Language, string>;

/** Maps each supported language to its package registry. */
export const LANGUAGE_PACKAGE_REGISTRY = {
	[Language.TYPESCRIPT]: "NPM",
} as const satisfies Record<Language, string>;

/**
 * Validates the given package name based on the language type.
 * @param name - The name of the package to validate.
 * @param language - The programming language context to validate against.
 * @throws Will throw an error if the package name is invalid for TypeScript.
 */
export function validatePackageName(name: string, language: Language) {
	switch (language) {
		case Language.TYPESCRIPT: {
			const validation = validateTypescriptPackageName(name);
			if (validation !== true)
				throw new Error(
					typeof validation === "string" ? validation : "Invalid package name",
				);

			break;
		}

		default:
			throw new Error(`Unsupported language: ${language}`);
	}
}

/**
 * Ensure the selected package manager is available on the system
 * and return a packageManager identifier string (e.g., "bun@1.2.0")
 * @param pm - The package manager to verify/resolve.
 */
export async function ensurePackageManager(
	pm: PackageManager,
): Promise<string> {
	switch (pm) {
		case "pnpm": {
			if (!(await commandExistsAsync("pnpm")))
				throw new Error(
					"pnpm is not installed. Please install PNPM and re-run.",
				);

			const version = await runAsync("pnpm --version");
			return `pnpm@${version}`;
		}

		default:
			throw new Error(`Unsupported package manager: ${pm}`);
	}
}

/**
 * Get the install command for the specified package manager to display in the next-steps box.
 * @param pm - The package manager to use.
 * @returns The shell command to install dependencies (e.g., "pnpm install").
 */
export function getInstallScript(pm: PackageManager): string {
	switch (pm) {
		case "pnpm":
			return "pnpm install";

		default:
			throw new Error(`Unsupported package manager: ${pm}`);
	}
}
