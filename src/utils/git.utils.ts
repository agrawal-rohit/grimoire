import fs from "node:fs";
import path from "node:path";
import { toSlug } from "./common.utils";
import { runAsync } from "./shell.utils";

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
		// Initialize repository
		await runAsync("git init", { cwd, stdio: "ignore" });

		// Try to set the default branch to the desired name.
		// On newer git versions, `git branch -M` works, older ones may require `symbolic-ref`.
		try {
			await runAsync(`git branch -M ${defaultBranch}`, {
				cwd,
				stdio: "ignore",
			});
		} catch {
			try {
				await runAsync(`git symbolic-ref HEAD refs/heads/${defaultBranch}`, {
					cwd,
					stdio: "ignore",
				});
			} catch {
				// If both attempts fail, continue without failing the setup.
			}
		}
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new Error(`Failed to initialize git repository in ${cwd}: ${msg}`);
	}
}

/**
 * Estimate a GitHub repository URL from a possible owner (name or username) and project name.
 * @param owner - GitHub username or author's name (will be slugified). If undefined, returns undefined.
 * @param projectName - The target project/package name (will be slugified).
 * @returns A URL like "https://github.com/<owner>/<repo>" or undefined if owner is missing.
 */
export function estimateGithubRepoUrl(
	owner: string | undefined,
	projectName: string,
): string | undefined {
	if (!owner) return undefined;
	const ownerSlug = toSlug(owner);
	const repoSlug = toSlug(projectName);
	return `https://github.com/${ownerSlug}/${repoSlug}`;
}
