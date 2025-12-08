import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock node modules and internal modules
vi.mock("node:fs", () => ({
	default: {
		promises: {
			readdir: vi.fn(),
			readFile: vi.fn(),
		},
	},
}));

vi.mock("spdx-license-list/licenses/MIT.json", () => ({
	default: {
		licenseText: "MIT License\n\nCopyright (c) <year> <copyright holders>\n\nPermission is hereby granted...",
	},
}));

vi.mock("../../../src/core/constants", () => ({
	IS_LOCAL_MODE: false,
}));

vi.mock("../../../src/core/fs", () => ({
	copyDirSafeAsync: vi.fn(),
	ensureDirAsync: vi.fn(),
	removeFilesByBasename: vi.fn(),
	renderMustacheTemplates: vi.fn(),
	writeFileAsync: vi.fn(),
}));

vi.mock("../../../src/core/git", () => ({
	getGitEmail: vi.fn(),
	getGitUsername: vi.fn(),
}));

vi.mock("../../../src/core/pkg-manager", () => ({
	LANGUAGE_PACKAGE_REGISTRY: {
		typescript: "npm",
	},
	validatePackageName: vi.fn(),
}));

vi.mock("../../../src/core/template-registry", () => ({
	listAvailableTemplates: vi.fn(),
	resolveTemplatesDir: vi.fn(),
}));

vi.mock("../../../src/core/utils", () => ({
	capitalizeFirstLetter: vi.fn(),
	toSlug: vi.fn(),
}));

vi.mock("../../../src/cli/prompts", () => ({
	default: {
		selectInput: vi.fn(),
		textInput: vi.fn(),
		confirmInput: vi.fn(),
	},
}));

vi.mock("../../../src/cli/tasks", () => ({
	default: {
		runWithTasks: vi.fn(async (goal, task) => {
			if (task) await task();
		}),
	},
}));

// Import after mocks
import {
	createPackageDirectory,
	applyTemplateModifications,
	getRequiredGithubSecrets,
	writePackageTemplateFiles,
} from "../../../src/summon/package/setup";
import { Language } from "../../../src/summon/package/config";
import fs from "node:fs";
import {
	copyDirSafeAsync,
	ensureDirAsync,
	removeFilesByBasename,
	renderMustacheTemplates,
	writeFileAsync,
} from "../../../src/core/fs";
import { resolveTemplatesDir } from "../../../src/core/template-registry";

describe("summon/package/setup", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("createPackageDirectory", () => {
		it("should create the package directory and return the absolute path", async () => {
			const cwd = "/home/user";
			const packageName = "my-package";
			const expectedPath = "/home/user/my-package";

			vi.mocked(ensureDirAsync).mockResolvedValue();

			const result = await createPackageDirectory(cwd, packageName);

			expect(ensureDirAsync).toHaveBeenCalledWith(expectedPath);
			expect(result).toBe(expectedPath);
		});
	});

	describe("applyTemplateModifications", () => {
		it("should render mustache templates with metadata", async () => {
			const targetDir = "/path/to/package";
			const summonConfig = {
				lang: Language.TYPESCRIPT,
				name: "test-package",
				template: "basic",
				public: true,
				authorName: "John Doe",
			};
			const packageManagerVersion = "pnpm@9.0.0";
			const expectedMetadata = {
				packageManagerVersion,
				templateHasPlayground: true,
				...summonConfig,
			};

			vi.mocked(renderMustacheTemplates).mockResolvedValue();

			await applyTemplateModifications(targetDir, summonConfig, packageManagerVersion);

			expect(renderMustacheTemplates).toHaveBeenCalledWith(targetDir, expectedMetadata);
		});

		it("should remove public files if package is not public", async () => {
			const targetDir = "/path/to/package";
			const summonConfig = {
				lang: Language.TYPESCRIPT,
				name: "test-package",
				template: "default",
				public: false,
			};
			const packageManagerVersion = "pnpm@9.0.0";

			vi.mocked(renderMustacheTemplates).mockResolvedValue();
			vi.mocked(removeFilesByBasename).mockResolvedValue();

			await applyTemplateModifications(targetDir, summonConfig, packageManagerVersion);

			expect(removeFilesByBasename).toHaveBeenCalledWith(targetDir, [
				"CODE_OF_CONDUCT.md",
				"CONTRIBUTING.md",
				"issue_template",
				"pull_request_template.md",
				"release.mustache.yml",
			]);
		});

		it("should not remove public files if package is public", async () => {
			const targetDir = "/path/to/package";
			const summonConfig = {
				lang: Language.TYPESCRIPT,
				name: "test-package",
				template: "basic",
				public: true,
			};
			const packageManagerVersion = "pnpm@9.0.0";

			vi.mocked(renderMustacheTemplates).mockResolvedValue();

			await applyTemplateModifications(targetDir, summonConfig, packageManagerVersion);

			expect(removeFilesByBasename).not.toHaveBeenCalled();
		});
	});

	describe("getRequiredGithubSecrets", () => {
		it("should return an empty array if no workflows directory exists", async () => {
			const targetDir = "/path/to/package";

			vi.mocked(fs.promises.readdir).mockRejectedValue(new Error("ENOENT"));

			const result = await getRequiredGithubSecrets(targetDir);

			expect(result).toEqual([]);
		});

		it("should extract and return sorted unique secrets from workflow files", async () => {
			const targetDir = "/path/to/package";
			const workflowsDir = "/path/to/package/.github/workflows";

			vi.mocked(fs.promises.readdir).mockResolvedValue([
				{ name: "ci.yml", isFile: () => true, isDirectory: () => false },
				{ name: "release.yml", isFile: () => true, isDirectory: () => false },
			] as any);
			vi.mocked(fs.promises.readFile)
				.mockResolvedValueOnce("secrets.NPM_TOKEN and secrets.GITHUB_TOKEN")
				.mockResolvedValueOnce("secrets.CODECOV_TOKEN");

			const result = await getRequiredGithubSecrets(targetDir);

			expect(fs.promises.readdir).toHaveBeenCalledWith(workflowsDir, { withFileTypes: true });
			expect(fs.promises.readFile).toHaveBeenCalledTimes(2);
			expect(result).toEqual(["CODECOV_TOKEN", "NPM_TOKEN"]);
		});

		it("should ignore GITHUB_TOKEN secrets", async () => {
			const targetDir = "/path/to/package";

			vi.mocked(fs.promises.readdir).mockResolvedValue([
				{ name: "ci.yml", isFile: () => true, isDirectory: () => false },
			] as any);
			vi.mocked(fs.promises.readFile).mockResolvedValue("secrets.GITHUB_TOKEN");

			const result = await getRequiredGithubSecrets(targetDir);

			expect(result).toEqual([]);
		});
	});

	describe("writePackageTemplateFiles", () => {
		it("should copy template directories", async () => {
			const targetDir = "/path/to/package";
			const summonConfig = {
				lang: Language.TYPESCRIPT,
				name: "test-package",
				template: "basic",
				public: false,
			};

			vi.mocked(resolveTemplatesDir)
				.mockResolvedValueOnce("/templates/shared")
				.mockResolvedValueOnce("/templates/typescript/shared")
				.mockResolvedValueOnce("/templates/typescript/package/shared")
				.mockResolvedValueOnce("/templates/typescript/package/basic");
			vi.mocked(copyDirSafeAsync).mockResolvedValue();

			await writePackageTemplateFiles(targetDir, summonConfig);

			expect(resolveTemplatesDir).toHaveBeenCalledWith("shared");
			expect(resolveTemplatesDir).toHaveBeenCalledWith(Language.TYPESCRIPT, "shared");
			expect(resolveTemplatesDir).toHaveBeenCalledWith(Language.TYPESCRIPT, "package/shared");
			expect(resolveTemplatesDir).toHaveBeenCalledWith(Language.TYPESCRIPT, "package/basic");
			expect(copyDirSafeAsync).toHaveBeenCalledTimes(4);
		});

		it("should add MIT license if package is public and authorName is provided", async () => {
			const targetDir = "/path/to/package";
			const summonConfig = {
				lang: Language.TYPESCRIPT,
				name: "test-package",
				template: "basic",
				public: true,
				authorName: "John Doe",
			};

			vi.mocked(resolveTemplatesDir).mockResolvedValue("/templates/dir");
			vi.mocked(copyDirSafeAsync).mockResolvedValue();
			vi.mocked(writeFileAsync).mockResolvedValue();

			// Mock Date
			const mockDate = new Date(2023, 0, 1);
			vi.spyOn(global, "Date").mockImplementation(() => mockDate as any);

			await writePackageTemplateFiles(targetDir, summonConfig);

			expect(writeFileAsync).toHaveBeenCalledWith(
				"/path/to/package/LICENSE",
				"MIT License\n\nCopyright (c) 2023 John Doe\n\nPermission is hereby granted...",
			);

			vi.restoreAllMocks();
		});

		it("should not add license if package is not public", async () => {
			const targetDir = "/path/to/package";
			const summonConfig = {
				lang: Language.TYPESCRIPT,
				name: "test-package",
				template: "basic",
				public: false,
			};

			vi.mocked(resolveTemplatesDir).mockResolvedValue("/templates/dir");
			vi.mocked(copyDirSafeAsync).mockResolvedValue();

			await writePackageTemplateFiles(targetDir, summonConfig);

			expect(writeFileAsync).not.toHaveBeenCalled();
		});

		it("should not add license if authorName is not provided", async () => {
			const targetDir = "/path/to/package";
			const summonConfig = {
				lang: Language.TYPESCRIPT,
				name: "test-package",
				template: "basic",
				public: true,
				authorName: undefined,
			};

			vi.mocked(resolveTemplatesDir).mockResolvedValue("/templates/dir");
			vi.mocked(copyDirSafeAsync).mockResolvedValue();

			await writePackageTemplateFiles(targetDir, summonConfig);

			expect(writeFileAsync).not.toHaveBeenCalled();
		});
	});
});
