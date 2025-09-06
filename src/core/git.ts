import { execSync } from "node:child_process";

/**
 * Try to read git config for the given key.
 * Returns undefined if git is not installed or the key is not set.
 * @param key Git config key (e.g., "user.name" or "user.email")
 */
function readGitConfig(key: string): string | undefined {
  try {
    const out = execSync(`git config --get ${key}`, {
      stdio: ["ignore", "pipe", "ignore"],
    });
    const s = out.toString().trim();
    return s.length ? s : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get git user.name from local/global git config.
 * @returns The configured git user.name, or undefined if not set
 */
export function getGitUsername(): string | undefined {
  return readGitConfig("user.name");
}

/**
 * Get git user.email from local/global git config.
 * @returns The configured git user.email, or undefined if not set
 */
export function getGitEmail(): string | undefined {
  return readGitConfig("user.email");
}
