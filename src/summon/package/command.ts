import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import logger from "../../cli/logger";
import tasks from "../../cli/tasks";
import { initGitRepo, makeInitialCommit } from "../../core/git";
import {
	ensurePackageManager,
	getInstallScript,
	LANGUAGE_PACKAGE_MANAGER,
	type PackageManager,
} from "../../core/pkg-manager";
import {
	getSummonPackageConfiguration,
	type SummonPackageConfiguration,
} from "./config";
import {
	applyTemplateModifications,
	createPackageDirectory,
	writePackageTemplateFiles,
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

	let packageManagerVersion = "";
	const packageManager: PackageManager =
		LANGUAGE_PACKAGE_MANAGER[summonConfig.lang];
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
			title: `Add "${summonConfig.template}" template`,
			task: async () => {
				await writePackageTemplateFiles(targetDir, summonConfig);
			},
		},
		{
			title: "Modify template with user preferences",
			task: async () => {
				await applyTemplateModifications(
					targetDir,
					summonConfig,
					packageManagerVersion,
				);
			},
		},
	]);

	await tasks.runWithTasks("Finishing up", undefined, [
		{
			title: "Initialize git",
			task: async () => {
				await initGitRepo(targetDir);
			},
		},
		{
			title: "Make initial commit",
			task: async () => {
				await makeInitialCommit(targetDir);
			},
		},
	]);

	const installCmd = getInstallScript(packageManager);

	console.log();
	console.log(chalk.bold("Summoning complete. Next steps:"));
	console.log();
	console.log(
		`  Enter your package directory using ${chalk.magentaBright(`cd ${summonConfig.name}`)}`,
	);
	console.log(`  Install dependencies with ${chalk.magentaBright(installCmd)}`);
	console.log();
	console.log(
		`Stuck? Open an issue at ${chalk.magentaBright("https://github.com/agrawal-rohit/grimoire/issues")}`,
	);
	console.log();
}

export default runSummonPackage;
