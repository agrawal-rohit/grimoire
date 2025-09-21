import { execSync } from "node:child_process";
import type { RunOptions } from "../types/shell.types";

/**
 * Run a shell command and return its stdout as a trimmed string.
 * Throws an error if the command exits with a non-zero code.
 * @param cmd - The shell command to run.
 * @param opts - Optional run options to customize execution.
 * @returns The trimmed stdout when stdio is "pipe"; otherwise an empty string.
 */
export function run(cmd: string, opts: RunOptions = {}): string {
	const { cwd, stdio = "pipe", env, timeoutMs } = opts;

	const out = execSync(cmd, {
		cwd,
		stdio,
		env: { ...process.env, ...env },
		timeout: timeoutMs,
	});

	return stdio === "pipe" ? out.toString().trim() : "";
}

/**
 * Run a command and return either the stdout or the error without throwing.
 * @param cmd - The shell command to run.
 * @param opts - Optional run options to customize execution.
 * @returns An object containing ok and either stdout (on success) or error (on failure).
 */
export function runSafe(
	cmd: string,
	opts: RunOptions = {},
): { ok: true; stdout: string } | { ok: false; error: Error } {
	try {
		const stdout = run(cmd, opts);
		return { ok: true, stdout };
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err));
		return { ok: false, error };
	}
}

/**
 * Check if a command exists on the current system PATH.
 * @param command - The command name to check.
 * @returns true if the command exists on PATH, false otherwise.
 */
export function commandExists(command: string): boolean {
	try {
		if (process.platform === "win32") {
			// where exits with non-zero when not found
			run(`where ${command}`);
		} else {
			// command -v exits with non-zero when not found
			run(`command -v ${command}`);
		}
		return true;
	} catch {
		return false;
	}
}
