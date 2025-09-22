import { exec, spawn } from "node:child_process";
import type { RunOptions } from "../types/shell.types";

/**
 * Run a shell command asynchronously and resolve with stdout (trimmed).
 * When stdio is "inherit", streams are inherited and an empty string is resolved on success.
 * @param cmd - The shell command to run.
 * @param opts - Optional run options to customize execution.
 */
export function runAsync(cmd: string, opts: RunOptions = {}): Promise<string> {
	const { cwd, stdio = "pipe", env, timeoutMs } = opts;

	// Inherit stdio: use spawn for better stream behavior
	if (stdio === "inherit") {
		return new Promise((resolve, reject) => {
			const child = spawn(cmd, {
				cwd,
				env: { ...process.env, ...env },
				shell: true,
				stdio: "inherit",
				timeout: timeoutMs,
			} as any);

			child.on("error", reject);
			child.on("close", (code) => {
				if (code === 0) resolve("");
				else reject(new Error(`Command failed: ${cmd} (exit ${code})`));
			});
		});
	}

	// Default: capture stdout/stderr using exec
	return new Promise((resolve, reject) => {
		exec(
			cmd,
			{
				cwd,
				env: { ...process.env, ...env },
				timeout: timeoutMs,
			},
			(error, stdout) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(String(stdout).trim());
			},
		);
	});
}

/**
 * Async variant of commandExists.
 * @param command - The command name to check.
 * @returns Promise resolving to true if the command exists on PATH, false otherwise.
 */
export async function commandExistsAsync(command: string): Promise<boolean> {
	try {
		if (process.platform === "win32") {
			await runAsync(`where ${command}`, { stdio: "ignore" });
		} else {
			await runAsync(`command -v ${command}`, { stdio: "ignore" });
		}
		return true;
	} catch {
		return false;
	}
}
