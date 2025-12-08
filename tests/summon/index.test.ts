import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock node modules and internal modules
vi.mock("../../src/cli/logger", () => ({
	default: {
		error: vi.fn(),
	},
}));

vi.mock("../../src/summon/package/command", () => ({
	default: vi.fn(),
}));

// Import after mocks
import { registerSummonCli } from "../../src/summon/index";
import logger from "../../src/cli/logger";
import runSummonPackage from "../../src/summon/package/command";

describe("summon/index", () => {
	let mockApp: any;
	let mockCommand: any;
	let capturedAction: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockCommand = {
			option: vi.fn().mockReturnThis(),
			action: vi.fn((fn: any) => {
				capturedAction = fn;
			}),
		};
		mockApp = {
			usage: vi.fn(),
			command: vi.fn(() => mockCommand),
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("registerSummonCli", () => {
		it("should register the summon command with correct usage and options", () => {
			registerSummonCli(mockApp);

			expect(mockApp.usage).toHaveBeenCalledWith("summon <resource> [options]");
			expect(mockApp.command).toHaveBeenCalledWith("summon [resource]", "Summon a resource");

			expect(mockCommand.option).toHaveBeenCalledWith("--name <name>", "Package name");
			expect(mockCommand.option).toHaveBeenCalledWith("--lang <lang>", "Target language (e.g., typescript)");
			expect(mockCommand.option).toHaveBeenCalledWith("--public", "Public package (will setup for publishing to a package registry)");
			expect(mockCommand.option).toHaveBeenCalledWith("--template <template>", "Starter template for the package");
		});

		it("should call runSummonPackage for resource 'package' with correct options", async () => {
			vi.mocked(runSummonPackage).mockResolvedValue();

			registerSummonCli(mockApp);
			await capturedAction("package", { name: "test", lang: "typescript", public: true, template: "basic" });

			expect(runSummonPackage).toHaveBeenCalledWith({
				lang: "typescript",
				name: "test",
				template: "basic",
				public: true,
			});
		});

		it("should convert public option to boolean for package", async () => {
			vi.mocked(runSummonPackage).mockResolvedValue();

			registerSummonCli(mockApp);
			await capturedAction("package", { public: "true" });

			expect(runSummonPackage).toHaveBeenCalledWith({
				lang: undefined,
				name: undefined,
				template: undefined,
				public: true,
			});
		});

		it("should log usage for unknown resource", async () => {
			const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			registerSummonCli(mockApp);
			await capturedAction("unknown", {});

			expect(console.log).toHaveBeenCalledWith("Usage: grimoire summon <resource>\n");
			expect(console.log).toHaveBeenCalledWith("Available resources:");
			expect(console.log).toHaveBeenCalledWith("  package   Create a new package");

			consoleLogSpy.mockRestore();
		});

		it("should log error for thrown exceptions", async () => {
			const error = new Error("Test error");
			vi.mocked(runSummonPackage).mockRejectedValue(error);

			registerSummonCli(mockApp);
			await capturedAction("package", {});

			expect(logger.error).toHaveBeenCalledWith("Test error");
		});

		it("should log string error for non-Error exceptions", async () => {
			vi.mocked(runSummonPackage).mockRejectedValue("String error");

			registerSummonCli(mockApp);
			await capturedAction("package", {});

			expect(logger.error).toHaveBeenCalledWith("String error");
		});
	});
});
