import { PackageManager } from "../types/prompts.types";
import { commandExistsAsync, runAsync } from "./shell.utils";

/**
 * Try to activate pnpm/yarn via Corepack.
 * Returns true if the tool is available afterwards.
 * @param tool - The package manager to activate ("pnpm" | "yarn").
 */
async function activateViaCorepack(tool: "pnpm" | "yarn"): Promise<boolean> {
	if (!(await commandExistsAsync("corepack"))) return false;
	try {
		// Idempotent enable
		await runAsync("corepack enable", { stdio: "ignore" });

		if (tool === "pnpm") {
			await runAsync("corepack prepare pnpm@latest --activate", {
				stdio: "ignore",
			});
		} else {
			await runAsync("corepack prepare yarn@stable --activate", {
				stdio: "ignore",
			});
		}

		return await commandExistsAsync(tool);
	} catch {
		return false;
	}
}

/**
 * Install a package globally using npm.
 * @param pkg - The package name to install globally (e.g., "pnpm").
 * @returns true if the tool is available afterwards.
 */
async function installGloballyWithNpm(pkg: string): Promise<boolean> {
	try {
		await runAsync(`npm i -g ${pkg}`, { stdio: "ignore" });
		return await commandExistsAsync(pkg);
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
export async function ensurePackageManager(
	pm: PackageManager,
): Promise<string> {
	switch (pm) {
		case PackageManager.NPM: {
			if (!(await commandExistsAsync("npm"))) {
				throw new Error(
					"npm is not available on PATH. Please install Node.js (which includes npm) and try again.",
				);
			}

			const version = await runAsync("npm --version");
			return `npm@${version}`;
		}

		case PackageManager.PNPM: {
			if (await commandExistsAsync("pnpm")) {
				const version = await runAsync("pnpm --version");
				return `pnpm@${version}`;
			}

			// Try Corepack activation
			if (await activateViaCorepack("pnpm")) {
				const version = await runAsync("pnpm --version");
				return `pnpm@${version}`;
			}

			// Fallback: npm -g install
			if (await installGloballyWithNpm("pnpm")) {
				const version = await runAsync("pnpm --version");
				return `pnpm@${version}`;
			}

			throw new Error(
				"Failed to install pnpm automatically. Please install pnpm and re-run the command.",
			);
		}

		case PackageManager.YARN: {
			if (await commandExistsAsync("yarn")) {
				const version = await runAsync("yarn --version");
				return `yarn@${version}`;
			}

			// Try Corepack activation
			if (await activateViaCorepack("yarn")) {
				const version = await runAsync("yarn --version");
				return `yarn@${version}`;
			}

			// Fallback: npm -g install
			if (await installGloballyWithNpm("yarn")) {
				const version = await runAsync("yarn --version");
				return `yarn@${version}`;
			}

			throw new Error(
				"Failed to install yarn automatically. Please install yarn and re-run the command.",
			);
		}

		case PackageManager.BUN: {
			if (!(await commandExistsAsync("bun"))) {
				throw new Error(
					"Bun is not installed. Please install Bun from https://bun.sh and re-run.",
				);
			}
			const version = await runAsync("bun --version");
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

	await runAsync(installCmd, { cwd: targetDir, stdio: "ignore" });
}

/**
 * Install a list of dependencies for the project.
 * @param targetDir - Absolute path to the project directory.
 * @param pm - Selected package manager.
 * @param packages - A list of dependency specifiers (e.g., ["react", "emotion"]).
 */
export async function installDependencies(
	targetDir: string,
	pm: PackageManager,
	packages: string[],
): Promise<void> {
	if (!packages || packages.length === 0) return;

	const specs = packages.join(" ");
	const cmd =
		pm === PackageManager.PNPM
			? `pnpm add ${specs}`
			: pm === PackageManager.YARN
				? `yarn add ${specs}`
				: pm === PackageManager.BUN
					? `bun add ${specs}`
					: `npm install ${specs}`;

	await runAsync(cmd, { cwd: targetDir, stdio: "ignore" });
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

	await runAsync(cmd, { cwd: targetDir, stdio: "ignore" });
}
