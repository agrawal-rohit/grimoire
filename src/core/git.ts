import fs from "node:fs";
import path from "node:path";
import { runAsync } from "./shell";

/**
 * Read a git config value for a given key from the current environment.
 * This will look up git configuration (local/global/system) based on how git resolves it.
 * @param key - Fully qualified git config key (e.g., "user.name", "user.email")
 * @returns The config value if set; undefined otherwise
 */
async function readGitConfig(key: string): Promise<string | undefined> {
	try {
		const out = await runAsync(`git config --get ${key}`, { stdio: "pipe" });
		const s = out.trim();
		return s.length ? s : undefined;
	} catch {
		return undefined;
	}
}

/**
 * Get git user.name from current git configuration.
 * @returns The configured git user.name, or undefined if not available.
 */
export async function getGitUsername(): Promise<string | undefined> {
	return await readGitConfig("user.name");
}

/**
 * Get git user.email from current git configuration.
 * @returns The configured git user.email, or undefined if not available.
 */
export async function getGitEmail(): Promise<string | undefined> {
	return await readGitConfig("user.email");
}

/**
 * Determine whether a directory already contains a git repository.
 * @param cwd - Absolute path to the target directory
 * @returns true if a .git directory exists inside cwd; false otherwise
 */
export function isGitRepo(cwd: string): boolean {
	return fs.existsSync(path.join(cwd, ".git"));
}

/**
 * Initialize a git repository in the provided directory.
 * @param cwd - Absolute path to the target directory where git should be initialized
 * @throws Error when initialization fails due to underlying git issues
 */
export async function initGitRepo(cwd: string): Promise<void> {
	if (isGitRepo(cwd)) return;

	const defaultBranch = "main";

	try {
		await runAsync(`git init -b ${defaultBranch}`, { cwd, stdio: "ignore" });
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new Error(`Failed to initialize git repository in ${cwd}: ${msg}`);
	}
}

/**
 * Initialize a git repository in the provided directory.
 * @param cwd - Absolute path to the target directory where git should be initialized
 * @throws Error when initialization fails due to underlying git issues
 */
export async function makeInitialCommit(cwd: string): Promise<void> {
	try {
		// Ensure a repository exists
		if (!isGitRepo(cwd)) await initGitRepo(cwd);

		// Stage all files and create an initial commit
		await runAsync("git add -A", { cwd, stdio: "ignore" });
		await runAsync('git commit -m "chore: initial commit"', {
			cwd,
			stdio: "ignore",
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new Error(`Failed to create initial git commit in ${cwd}: ${msg}`);
	}
}
