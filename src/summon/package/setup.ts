import fs from "node:fs";
import path from "node:path";
import mitLicense from "spdx-license-list/licenses/MIT.json";
import {
	copyDirSafeAsync,
	ensureDirAsync,
	removeFilesByBasename,
	renderMustacheTemplates,
	writeFileAsync,
} from "../../core/fs";
import { resolveTemplatesDir } from "../../core/template-registry";

import type { SummonPackageConfiguration } from "./config";
import { templatePublicPaths } from "./config";

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
export async function applyTemplateModifications(
	targetDir: string,
	summonConfig: SummonPackageConfiguration,
	packageManagerVersion: string,
): Promise<void> {
	const templateMetadata = {
		packageManagerVersion,
		...summonConfig,
	};

	await renderMustacheTemplates(targetDir, templateMetadata);
}

export async function getRequiredGithubSecrets(
	targetDir: string,
): Promise<string[]> {
	const secrets = new Set<string>();

	try {
		const workflowsDir = path.join(targetDir, ".github", "workflows");
		const entries = await fs.promises.readdir(workflowsDir, {
			withFileTypes: true,
		});
		const files = entries
			.filter((e) => e.isFile())
			.map((e) => path.join(workflowsDir, e.name));

		const secretRegex = /secrets\.([A-Z0-9_]+)/g;
		for (const file of files) {
			const content = await fs.promises.readFile(file, "utf8");
			for (const match of content.matchAll(secretRegex)) {
				const key = match[1];
				if (key && key.toUpperCase() !== "GITHUB_TOKEN") {
					secrets.add(key);
				}
			}
		}
	} catch {
		// No workflows directory found; ignore
	}

	return Array.from(secrets).sort();
}
/**
 * Write the chosen template files for a resource into the target directory.
 * @param targetDir - Package root directory to write into.
 * @param summonConfig - Summon configuration describing the new package.
 * @returns A promise that resolves when the template files have been written.
 */
export async function writePackageTemplateFiles(
	targetDir: string,
	summonConfig: SummonPackageConfiguration,
): Promise<void> {
	// Global shared: templates/shared
	const globalShared = await resolveTemplatesDir("shared");
	await copyDirSafeAsync(globalShared, targetDir);

	// Language shared: templates/<lang>/shared
	const langShared = await resolveTemplatesDir(summonConfig.lang, "shared");
	await copyDirSafeAsync(langShared, targetDir);

	// Item-specific shared: templates/<lang>/package/shared
	const itemShared = await resolveTemplatesDir(
		summonConfig.lang,
		"package/shared",
	);
	await copyDirSafeAsync(itemShared, targetDir);

	// Item-specific template: templates/<lang>/package/<template>
	const chosenTemplateDir = await resolveTemplatesDir(
		summonConfig.lang,
		`package/${summonConfig.template}`,
	);
	await copyDirSafeAsync(chosenTemplateDir, targetDir);

	// Remove public files from the targetDir if a private package is requested
	if (!summonConfig.public) {
		const publicFiles = [
			...templatePublicPaths.shared,
			...(templatePublicPaths[summonConfig.lang] ?? []),
		];

		await removeFilesByBasename(targetDir, publicFiles);
	}

	// Add MIT license
	if (summonConfig.authorName) {
		const year = new Date().getFullYear().toString();

		const licenseText = mitLicense.licenseText
			.replace("<year>", year)
			.replace("<copyright holders>", summonConfig.authorName);

		await writeFileAsync(path.join(targetDir, "LICENSE"), licenseText);
	}
}
