import fs from "node:fs";
import path from "node:path";
import logger from "../../cli/logger";
import tasks from "../../cli/tasks";
import { initGitRepo } from "../../core/git";
import {
	ensurePackageManager,
	installAllDependencies,
	LANGUAGE_PACKAGE_MANAGER,
	type PackageManager,
} from "../../core/pkg-manager";
import {
	getSummonPackageConfiguration,
	type SummonPackageConfiguration,
} from "./config";
import {
	createPackageDirectory,
	writePackageJson,
	writeStarterTemplate,
} from "./setup";

/** Entry point for "grimoire summon package".*/
export async function runSummonPackage(
	options: Partial<SummonPackageConfiguration> = {},
): Promise<void> {
	await logger.intro("starting summoning...");

	// Gather configuration (skip prompts when options are provided)
	const summonConfig = await getSummonPackageConfiguration({
		lang: options.lang,
		name: options.name,
		template: options.template,
		public: options.public,
	});

	const packageManager: PackageManager =
		LANGUAGE_PACKAGE_MANAGER[summonConfig.lang];
	let packageManagerVersion = "";
	const resolvedTargetDir = path.resolve(process.cwd(), summonConfig.name);

	// Preflight checks
	console.log();
	await tasks.runWithTasks("Preflight checks", async () => {
		// Check target directory
		let isEmpty = true;
		if (fs.existsSync(resolvedTargetDir)) {
			try {
				const files = fs.readdirSync(resolvedTargetDir);
				isEmpty = files.length === 0;
			} catch {
				isEmpty = true;
			}
		}

		if (!isEmpty)
			throw new Error(`Target directory is not empty: ${resolvedTargetDir}`);

		// Check package manager availability
		packageManagerVersion = await ensurePackageManager(packageManager);
	});

	// Create the package
	let targetDir = "";
	await tasks.runWithTasks("Preparing package", undefined, [
		{
			title: "Create package directory",
			task: async () => {
				targetDir = await createPackageDirectory(
					process.cwd(),
					summonConfig.name,
				);
			},
		},
		{
			title: "Add starter template",
			task: async () => {
				await writeStarterTemplate(targetDir, summonConfig);
			},
		},
		{
			title: "Create package manifest",
			task: async () => {
				await writePackageJson(targetDir, summonConfig, packageManagerVersion);
			},
		},
		{
			title: "Install dependencies",
			task: async () => {
				await installAllDependencies(targetDir, packageManager);
			},
		},
		{
			title: "Initialize git with initial commit",
			task: async () => {
				await initGitRepo(targetDir);
			},
		},
	]);
}

export default runSummonPackage;
