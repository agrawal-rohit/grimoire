import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runAsync, commandExistsAsync } from "../../src/core/shell";
import { exec, spawn } from "node:child_process";

vi.mock("node:child_process", () => {
	return {
		exec: vi.fn(),
		spawn: vi.fn(),
	};
});

describe("core/shell", () => {
	let execMock: any;
	let spawnMock: any;

	beforeEach(() => {
		execMock = exec as unknown as any;
		spawnMock = spawn as unknown as any;

		(execMock as any).mockReset();
		(spawnMock as any).mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("runAsync", () => {
		it("uses exec and resolves trimmed stdout when stdio is pipe (default)", async () => {
			(execMock as any).mockImplementation(
				(
					cmd: string,
					options: any,
					callback: (err: any, stdout: any, stderr: any) => void,
				) => {
					expect(cmd).toBe("echo test");
					callback(null, "  ok \n", "");
				},
			);

			const result = await runAsync("echo test");

			expect(result).toBe("ok");
			expect(execMock).toHaveBeenCalledTimes(1);
		});

		it("passes cwd, env, and timeoutMs to exec when stdio is pipe", async () => {
			(execMock as any).mockImplementation(
				(
					cmd: string,
					options: { cwd?: string; env?: any; timeout?: number },
					callback: (err: any, stdout: any, stderr: any) => void,
				) => {
					expect(cmd).toBe("echo env");
					expect(options.cwd).toBe("/tmp/project");
					expect(options.timeout).toBe(1234);
					expect(options.env).toMatchObject({
						EXTRA: "1",
					});
					callback(null, "done", "");
				},
			);

			const result = await runAsync("echo env", {
				cwd: "/tmp/project",
				env: { EXTRA: "1" },
				timeoutMs: 1234,
				stdio: "pipe",
			});

			expect(result).toBe("done");
		});

		it("rejects when exec returns an error", async () => {
			const error = new Error("exec failed");
			(execMock as any).mockImplementation(
				(
					cmd: string,
					options: any,
					callback: (err: any, stdout: any, stderr: any) => void,
				) => {
					callback(error, "", "");
				},
			);

			await expect(runAsync("bad command")).rejects.toBe(error);
		});

		it("uses spawn and resolves empty string when stdio is inherit and exit code is 0", async () => {
			const fakeChild = {
				on: vi.fn(),
			};

			(spawnMock as any).mockReturnValue(fakeChild);

			// Simulate event handlers being attached, then trigger them
			(fakeChild.on as any).mockImplementation(
				(event: string, handler: (arg?: any) => void) => {
					if (event === "error") {
						// do nothing for this test
					}
					if (event === "close") {
						// Simulate successful exit
						handler(0);
					}
					return fakeChild;
				},
			);

			const result = await runAsync("ls", { stdio: "inherit" });

			expect(result).toBe("");
			expect(spawnMock).toHaveBeenCalledWith("ls", {
				cwd: undefined,
				env: expect.any(Object),
				shell: true,
				stdio: "inherit",
				timeout: undefined,
			});
		});

		describe("commandExistsAsync", () => {
			it("returns true when command exists on non-Windows (uses 'command -v')", async () => {
				// Simulate a successful check on non-Windows by capturing the exec
				(execMock as any).mockImplementation(
					(
						cmd: string,
						options: any,
						callback: (err: any, stdout: any, stderr: any) => void,
					) => {
						expect(cmd).toBe("command -v node");
						expect(options).toMatchObject({
							env: expect.any(Object),
							timeout: undefined,
						});
						callback(null, "/usr/bin/node\n", "");
					},
				);

				// Force non-Windows branch
				const originalPlatform = process.platform;
				Object.defineProperty(process, "platform", {
					value: "linux",
				});

				const result = await commandExistsAsync("node");

				// restore platform
				Object.defineProperty(process, "platform", {
					value: originalPlatform,
				});

				expect(result).toBe(true);
			});

			it("returns true when command exists on Windows (uses 'where')", async () => {
				(execMock as any).mockImplementation(
					(
						cmd: string,
						options: any,
						callback: (err: any, stdout: any, stderr: any) => void,
					) => {
						expect(cmd).toBe("where node");
						callback(null, "C:\\\\Program Files\\\\node.exe\r\n", "");
					},
				);

				const originalPlatform = process.platform;
				Object.defineProperty(process, "platform", {
					value: "win32",
				});

				const result = await commandExistsAsync("node");

				Object.defineProperty(process, "platform", {
					value: originalPlatform,
				});

				expect(result).toBe(true);
			});

			it("returns false when the underlying check fails", async () => {
				(execMock as any).mockImplementation(
					(
						cmd: string,
						options: any,
						callback: (err: any, stdout: any, stderr: any) => void,
					) => {
						expect(cmd).toBe("command -v nonexistent-cmd");
						callback(new Error("not found"), "", "");
					},
				);

				const originalPlatform = process.platform;
				Object.defineProperty(process, "platform", {
					value: "linux",
				});

				const result = await commandExistsAsync("nonexistent-cmd");

				Object.defineProperty(process, "platform", {
					value: originalPlatform,
				});

				expect(result).toBe(false);
			});
		});

		it("passes cwd, env, and timeoutMs to spawn when stdio is inherit", async () => {
			const fakeChild = {
				on: vi.fn(),
			};

			(spawnMock as any).mockReturnValue(fakeChild);

			(fakeChild.on as any).mockImplementation(
				(event: string, handler: (arg?: any) => void) => {
					if (event === "close") {
						handler(0);
					}
					return fakeChild;
				},
			);

			await runAsync("npm test", {
				cwd: "/repo",
				env: { CI: "true" },
				timeoutMs: 5000,
				stdio: "inherit",
			});

			expect(spawnMock).toHaveBeenCalledWith("npm test", {
				cwd: "/repo",
				env: expect.objectContaining({ CI: "true" }),
				shell: true,
				stdio: "inherit",
				timeout: 5000,
			});
		});

		it("rejects when spawn emits an error", async () => {
			const fakeChild = {
				on: vi.fn(),
			};

			(spawnMock as any).mockReturnValue(fakeChild);

			const error = new Error("spawn failed");

			(fakeChild.on as any).mockImplementation(
				(event: string, handler: (arg?: any) => void) => {
					if (event === "error") {
						handler(error);
					}
					return fakeChild;
				},
			);

			await expect(
				runAsync("bad", { stdio: "inherit" }),
			).rejects.toBe(error);
		});

		it("rejects when spawn exits with non-zero code", async () => {
			const fakeChild = {
				on: vi.fn(),
			};

			(spawnMock as any).mockReturnValue(fakeChild);

			(fakeChild.on as any).mockImplementation(
				(event: string, handler: (arg?: any) => void) => {
					if (event === "close") {
						handler(2);
					}
					return fakeChild;
				},
			);

			await expect(
				runAsync("bad-exit", { stdio: "inherit" }),
			).rejects.toThrowError("Command failed: bad-exit (exit 2)");
		});
	});
});
