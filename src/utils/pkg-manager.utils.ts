import { PackageManager } from "../types/prompts.types";
import { commandExists, run } from "./shell.utils";

/**
 * Try to activate pnpm/yarn via Corepack.
 * Returns true if the tool is available afterwards.
 * @param tool - The package manager to activate ("pnpm" | "yarn").
 */
function activateViaCorepack(tool: "pnpm" | "yarn"): boolean {
	if (!commandExists("corepack")) return false;
	try {
		// Idempotent enable
		run("corepack enable", { stdio: "ignore" });

		if (tool === "pnpm") {
			run("corepack prepare pnpm@latest --activate", { stdio: "ignore" });
		} else {
			run("corepack prepare yarn@stable --activate", { stdio: "ignore" });
		}

		return commandExists(tool);
	} catch {
		return false;
	}
}

/**
 * Install a package globally using npm.
 * @param pkg - The package name to install globally (e.g., "pnpm").
 * @returns true if the tool is available afterwards.
 */
function installGloballyWithNpm(pkg: string): boolean {
	try {
		run(`npm i -g ${pkg}`, { stdio: "ignore" });
		return commandExists(pkg);
	} catch {
		return false;
	}
}

/**
 * Ensure the selected package manager is available on the system
 * and return a packageManager identifier string (e.g., "pnpm@9.0.0")
 * that can be added to package.json's "packageManager" field.
 * @param pm - The package manager to verify/resolve.
 */
export function ensurePackageManager(pm: PackageManager): string {
	switch (pm) {
		case PackageManager.NPM: {
			if (!commandExists("npm")) {
				throw new Error(
					"npm is not available on PATH. Please install Node.js (which includes npm) and try again.",
				);
			}

			const version = run("npm --version");
			return `npm@${version}`;
		}

		case PackageManager.PNPM: {
			if (commandExists("pnpm")) {
				const version = run("pnpm --version");
				return `pnpm@${version}`;
			}

			// Try Corepack activation
			if (activateViaCorepack("pnpm")) {
				const version = run("pnpm --version");
				return `pnpm@${version}`;
			}

			// Fallback: npm -g install
			if (installGloballyWithNpm("pnpm")) {
				const version = run("pnpm --version");
				return `pnpm@${version}`;
			}

			throw new Error(
				"Failed to install pnpm automatically. Please install pnpm and re-run the command.",
			);
		}

		case PackageManager.YARN: {
			if (commandExists("yarn")) {
				const version = run("yarn --version");
				return `yarn@${version}`;
			}

			// Try Corepack activation
			if (activateViaCorepack("yarn")) {
				const version = run("yarn --version");
				return `yarn@${version}`;
			}

			// Fallback: npm -g install
			if (installGloballyWithNpm("yarn")) {
				const version = run("yarn --version");
				return `yarn@${version}`;
			}

			throw new Error(
				"Failed to install yarn automatically. Please install yarn and re-run the command.",
			);
		}

		case PackageManager.BUN: {
			if (!commandExists("bun")) {
				throw new Error(
					"Bun is not installed. Please install Bun from https://bun.sh and re-run.",
				);
			}
			const version = run("bun --version");
			return `bun@${version}`;
		}

		default: {
			// Narrow type just in case a string sneaks through
			const val = String(pm);
			throw new Error(`Unsupported package manager: ${val}`);
		}
	}
}

/**
 * Install all dependencies for the project using the chosen package manager.
 * @param targetDir - Absolute path to the project directory.
 * @param pm - Selected package manager.
 */
export async function installAllDependencies(
	targetDir: string,
	pm: PackageManager,
): Promise<void> {
	const installCmd =
		pm === PackageManager.PNPM
			? "pnpm install"
			: pm === PackageManager.YARN
				? "yarn install"
				: pm === PackageManager.BUN
					? "bun install"
					: "npm install";

	run(installCmd, { cwd: targetDir, stdio: "ignore" });
}

/**
 * Install a list of development dependencies for the project.
 * @param targetDir - Absolute path to the project directory.
 * @param pm - Selected package manager.
 * @param packages - A list of dev dependency specifiers (e.g., ["jest", "typescript@^5"]).
 */
export async function installDevDependencies(
	targetDir: string,
	pm: PackageManager,
	packages: string[],
): Promise<void> {
	if (!packages || packages.length === 0) return;

	const specs = packages.join(" ");
	const cmd =
		pm === PackageManager.PNPM
			? `pnpm add -D ${specs}`
			: pm === PackageManager.YARN
				? `yarn add -D ${specs}`
				: pm === PackageManager.BUN
					? `bun add -d ${specs}`
					: `npm install -D ${specs}`;

	run(cmd, { cwd: targetDir, stdio: "ignore" });
}
