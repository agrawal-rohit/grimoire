import path from "node:path";
import {
	copyDirSafeAsync,
	ensureDirAsync,
	writeFileAsync,
} from "../../core/fs";
import { resolveTemplatesDir } from "../../core/template-registry";
import { toSlug } from "../../core/utils";
import type { SummonPackageConfiguration } from "./config";

/**
 * Creates the package directory based on the provided package name.
 * @param cwd - Current working directory (e.g., process.cwd()).
 * @param packageName - The name of the package, used as the directory name.
 * @returns The absolute path to the created package directory.
 */
export async function createPackageDirectory(
	cwd: string,
	packageName: string,
): Promise<string> {
	const targetDir = path.resolve(cwd, packageName);
	await ensureDirAsync(targetDir);
	return targetDir;
}

/**
 * Create the package.json using the provided answers and package manager version.
 * @param targetDir - Absolute path to the package directory.
 * @param summonConfig - Summon configuration describing the new package.
 * @param packageManagerVersion - A string like "pnpm@9.0.0" to record in package.json's packageManager.
 * @returns The final package.json object that was persisted to disk.
 * @throws If an existing package.json is invalid JSON.
 */
export async function writePackageJson(
	targetDir: string,
	summonConfig: SummonPackageConfiguration,
	packageManagerVersion: string,
): Promise<Record<string, unknown>> {
	const pkgJson: Record<string, unknown> = {
		name: summonConfig.name,
		version: "0.0.1",
		private: true,
		type: "module",
		packageManager: packageManagerVersion,
		main: "./dist/index.js",
		module: "./dist/index.js",
		types: "./dist/index.d.ts",
	};

	// Scripts defaults
	pkgJson.scripts = {
		test: "jest",
		lint: "pnpm exec biome lint --write",
		format: "pnpm exec biome format --write",
		check: "pnpm exec biome check --write",
		"test:cov": "jest --coverage --passWithNoTests",
		start: "tsdown --watch",
		build: "tsdown",
		release: summonConfig.public ? "semantic-release" : undefined,
		prepare: "husky",
	};

	// If the user opted to release to the package manager, include release-ready config
	if (summonConfig.public) {
		let pkgGithubURL = "";
		if (summonConfig.authorGitUsername)
			pkgGithubURL = `https://github.com/${toSlug(summonConfig.authorGitUsername)}/${toSlug(summonConfig.name)}`;

		pkgJson.license = "MIT";
		pkgJson.private = false;
		pkgJson.repository = pkgGithubURL;
		pkgJson.bugs = `${pkgGithubURL}/issues`;
		pkgJson.homepage = `${pkgGithubURL}#readme`;
		pkgJson.author = `${summonConfig.authorName} <${summonConfig.authorGitEmail}>`;
	}

	await writeFileAsync(
		path.join(targetDir, "package.json"),
		JSON.stringify(pkgJson, undefined, 2),
	);
	return pkgJson;
}

/**
 * Write a minimal starter template for the package (src/ and tests/).
 * @param targetDir - Package root directory to write into.
 */
export async function writeStarterTemplate(
	targetDir: string,
	summonConfig: SummonPackageConfiguration,
): Promise<void> {
	const { lang, template } = summonConfig;

	// Global shared: templates/shared
	try {
		const { path: globalShared } = await resolveTemplatesDir("shared");
		await copyDirSafeAsync(globalShared, targetDir);
	} catch {
		// No global shared available - ignore
	}

	// Language shared: templates/<lang>/shared
	try {
		const { path: langShared } = await resolveTemplatesDir(lang, "shared");
		await copyDirSafeAsync(langShared, targetDir);
	} catch {
		// No language shared available - ignore
	}

	// Item-specific shared: templates/<lang>/package/shared
	try {
		const { path: itemShared } = await resolveTemplatesDir(
			lang,
			"package/shared",
		);
		await copyDirSafeAsync(itemShared, targetDir);
	} catch {
		// No item shared available - ignore
	}

	// Item-specific template: templates/<lang>/package/<template>
	const { path: chosenTemplateDir } = await resolveTemplatesDir(
		lang,
		`package/${template}`,
	);

	await copyDirSafeAsync(chosenTemplateDir, targetDir);
}
