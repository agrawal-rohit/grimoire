import path from "node:path";
import type { PromptAnswers } from "../types/prompts.types";
import {
	PackageManager,
	Styling,
	TargetFramework,
} from "../types/prompts.types";
import { TEMPLATES_DIR } from "./constants.utils";
import { copyDirSafe, copyFileSafe, ensureDir, writeFile } from "./fs.utils";
import { estimateGithubRepoUrl } from "./git.utils";
import { installDevDependencies } from "./pkg-manager.utils";

/**
 * Build a human-readable author string for package.json from the provided details
 * @param authorInputs - Author details collected from prompts.
 * @returns A formatted author string or undefined if insufficient details.
 */
export function buildAuthorField(
	authorInputs: PromptAnswers["author"],
): string | undefined {
	const parts: string[] = [];
	if (authorInputs?.name) parts.push(authorInputs.name);
	if (authorInputs?.gitEmail) parts.push(`<${authorInputs.gitEmail}>`);
	return parts.length ? parts.join(" ") : undefined;
}

/**
 *
 * @param cwd - Current working directory (e.g., process.cwd()).
 * @param answers - Aggregated answers, used for the library name (directory).
 * @returns Object with the absolute targetDir.
 */
export function createProjectDirectory(
	cwd: string,
	projectName: string,
): string {
	const targetDir = path.resolve(cwd, projectName);
	ensureDir(targetDir);

	return targetDir;
}

/**
 * Create the package.json using the provided answers and package manager version.
 * @param targetDir - Absolute path to the project directory.
 * @param answers - Aggregated prompt answers describing the new project.
 * @param packageManagerVersion - A string like "pnpm@9.0.0" to record in package.json's packageManager.
 * @returns The final package.json object that was persisted to disk.
 * @throws If an existing package.json is invalid JSON.
 */
export function writePackageJson(
	targetDir: string,
	answers: PromptAnswers,
	packageManagerVersion: string,
): Record<string, unknown> {
	// Estimate repository and homepage from author name/git username and project name
	const estimatedRepoUrl = estimateGithubRepoUrl(
		answers.author.gitUsername,
		answers.project.name,
	);

	const pkgJson: Record<string, unknown> = {
		name: answers.project.name,
		version: "0.1.0",
		private: true,
		description: answers.project.description || "",
		packageManager: packageManagerVersion,
		repository: estimatedRepoUrl,
	};

	// Scripts defaults
	pkgJson.scripts = {
		test: "jest",
		build: "tsc",
		lint: "pnpm exec biome lint --write",
		format: "pnpm exec biome format --write",
		check: "pnpm exec biome check --write",
		"test:cov": "jest --coverage --passWithNoTests",
		prepack: "pnpm run build",
		release: answers.project.shouldReleaseToNPM
			? "semantic-release"
			: undefined,
		prepare: answers.tooling.precommitHooks ? "husky" : undefined,
	};

	// If the user opted to release to NPM, include npm-release-ready config
	if (answers.project.shouldReleaseToNPM) {
		pkgJson.author = buildAuthorField(answers.author);
		pkgJson.homepage = estimatedRepoUrl;
		pkgJson.files = ["dist", "package.json", "README.md"];
		pkgJson.private = false;
		pkgJson.license = "MIT";
		pkgJson.bugs = `${pkgJson.repository}/issues`;
	}

	writeFile(
		path.join(targetDir, "package.json"),
		JSON.stringify(pkgJson, undefined, 2),
	);
	return pkgJson;
}

/**
 * Write baseline configuration files like linters and hooks.
 * @param targetDir - Project root directory to write into.
 * @param answers - Prompt answers to conditionally apply features.
 */
export async function writeCommonConfig(
	targetDir: string,
	answers: PromptAnswers,
): Promise<void> {
	const commonTplRoot = path.join(TEMPLATES_DIR, "common");

	// Linters and repo-level configs
	copyFileSafe(
		path.join(commonTplRoot, ".nvmrc"),
		path.join(targetDir, ".nvmrc"),
	);
	copyFileSafe(
		path.join(commonTplRoot, "biome.template.json"),
		path.join(targetDir, "biome.json"),
	);
	copyFileSafe(
		path.join(commonTplRoot, "jest.config.js"),
		path.join(targetDir, "jest.config.js"),
	);
	copyFileSafe(
		path.join(commonTplRoot, ".gitignore"),
		path.join(targetDir, ".gitignore"),
	);
	copyFileSafe(
		path.join(commonTplRoot, "tsconfig.json"),
		path.join(targetDir, "tsconfig.json"),
	);

	// Community files
	const community = answers.tooling.community;
	if (community.codeOfConduct)
		copyFileSafe(
			path.join(commonTplRoot, "CODE_OF_CONDUCT.md"),
			path.join(targetDir, "CODE_OF_CONDUCT.md"),
		);

	if (community.contributing)
		copyFileSafe(
			path.join(commonTplRoot, "CONTRIBUTING.md"),
			path.join(targetDir, "CONTRIBUTING.md"),
		);

	if (community.license)
		copyFileSafe(
			path.join(commonTplRoot, "LICENSE"),
			path.join(targetDir, "LICENSE"),
		);

	if (community.readme)
		copyFileSafe(
			path.join(commonTplRoot, "README.md"),
			path.join(targetDir, "README.md"),
		);

	// GitHub helpers
	const ghTplRoot = path.join(commonTplRoot, ".github");
	const ghRoot = path.join(targetDir, ".github");

	if (answers.tooling.github.dependabot)
		copyFileSafe(
			path.join(ghTplRoot, "dependabot.yml"),
			path.join(ghRoot, "dependabot.yml"),
		);

	if (answers.tooling.github.workflows)
		copyDirSafe(
			path.join(ghTplRoot, "workflows"),
			path.join(ghRoot, "workflows"),
		);

	if (answers.tooling.github.templates) {
		copyDirSafe(
			path.join(ghTplRoot, "issue_template"),
			path.join(ghRoot, "issue_template"),
		);

		copyFileSafe(
			path.join(ghTplRoot, "pull_request_template.md"),
			path.join(ghRoot, "pull_request_template.md"),
		);
	}

	// Install common dev dependencies
	const commonDevPackages: string[] = [
		"typescript",
		"jest",
		"ts-jest",
		"@types/jest",
		"@types/node",
		"@biomejs/biome",
	];
	await installDevDependencies(
		targetDir,
		answers.project.packageManager ?? PackageManager.PNPM,
		commonDevPackages,
	);
}

/**
 * Write a minimal starter template for the project (src/ and tests/).
 * @param targetDir - Project root directory to write into.
 */
export async function writeStarterTemplate(targetDir: string): Promise<void> {
	const commonTplRoot = path.join(TEMPLATES_DIR, "common");

	// Baseline source and tests folders
	copyDirSafe(path.join(commonTplRoot, "src"), path.join(targetDir, "src"));
	copyDirSafe(path.join(commonTplRoot, "tests"), path.join(targetDir, "tests"));
}

/**
 * Configure release setup for NPM publishing.
 * Copies release.config.cjs and installs semantic-release if shouldReleaseToNPM is true.
 * @param targetDir - Project root directory.
 * @param answers - Prompt answers.
 * @param pm - Package manager.
 */
export async function configureRelease(
	targetDir: string,
	answers: PromptAnswers,
): Promise<void> {
	if (!answers.project.shouldReleaseToNPM) return;

	const commonTplRoot = path.join(TEMPLATES_DIR, "common");
	copyFileSafe(
		path.join(commonTplRoot, "release.config.cjs"),
		path.join(targetDir, "release.config.cjs"),
	);

	await installDevDependencies(targetDir, answers.project.packageManager, [
		"semantic-release",
	]);
}

/**
 * Configure pre-commit hooks integration.
 * Copies configs and hooks if precommitHooks is true, and installs relevant dependencies.
 * @param targetDir - Project root directory.
 * @param answers - Prompt answers.
 * @param pm - Package manager.
 */
export async function configurePrecommit(
	targetDir: string,
	answers: PromptAnswers,
): Promise<void> {
	if (!answers.tooling.precommitHooks) return;

	const commonTplRoot = path.join(TEMPLATES_DIR, "common");
	copyFileSafe(
		path.join(commonTplRoot, "commitlint.config.js"),
		path.join(targetDir, "commitlint.config.js"),
	);
	copyFileSafe(
		path.join(commonTplRoot, "lint-staged.config.js"),
		path.join(targetDir, "lint-staged.config.js"),
	);
	copyDirSafe(
		path.join(commonTplRoot, ".husky"),
		path.join(targetDir, ".husky"),
	);

	await installDevDependencies(targetDir, answers.project.packageManager, [
		"husky",
		"lint-staged",
		"@commitlint/cli",
		"@commitlint/config-conventional",
	]);
}

/**
 * Configure styling integration (e.g., TailwindCSS).
 * Copies configuration files and installs dependencies based on selected styling.
 * @param targetDir - Project root directory.
 * @param answers - Prompt answers.
 * @param pm - Package manager.
 */
export async function configureStyling(
	targetDir: string,
	answers: PromptAnswers,
): Promise<void> {
	if (answers.tooling.styling === Styling.NONE) return;

	// Tailwind CSS integration
	if (answers.tooling.styling === Styling.TAILWINDCSS) {
		const twTplRoot = path.join(TEMPLATES_DIR, "tailwindcss");

		// Root configs
		copyFileSafe(
			path.join(twTplRoot, "postcss.config.js"),
			path.join(targetDir, "postcss.config.js"),
		);
		copyFileSafe(
			path.join(twTplRoot, "tailwind.config.ts"),
			path.join(targetDir, "tailwind.config.ts"),
		);
		// Styles entrypoint
		copyFileSafe(
			path.join(twTplRoot, "tailwind.css"),
			path.join(targetDir, "src", "styles", "tailwind.css"),
		);

		await installDevDependencies(targetDir, answers.project.packageManager, [
			"tailwindcss",
			"postcss",
			"autoprefixer",
		]);
	}
}

/**
 * Configure target framework integration (e.g., React).
 * Copies templates based on selected framework.
 * @param targetDir - Project root directory to write into.
 * @param answers - Prompt answers.
 */
export async function configureTargetFramework(
	targetDir: string,
	answers: PromptAnswers,
): Promise<void> {
	// React-specific templates (if added in the future). This is a no-op if directory does not exist.
	if (answers.project.framework === TargetFramework.NONE) return;

	// React integration
	if (answers.project.framework === TargetFramework.REACT) {
		const reactTplRoot = path.join(TEMPLATES_DIR, "react");
		copyDirSafe(reactTplRoot, targetDir);
	}
}
