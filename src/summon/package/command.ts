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
import { toSlug } from "../../core/utils";
import {
	getSummonPackageConfiguration,
	type SummonPackageConfiguration,
} from "./config";
import {
	applyTemplateModifications,
	createPackageDirectory,
	getRequiredGithubSecrets,
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
	const resolvedTargetDir = path.resolve(
		process.cwd(),
		toSlug(summonConfig.name),
	);

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
					toSlug(summonConfig.name),
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

	let githubSecrets: string[] = [];
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
		{
			title: "Fetch github secrets list",
			task: async () => {
				githubSecrets = await getRequiredGithubSecrets(targetDir);
			},
		},
	]);

	const installCmd = getInstallScript(packageManager);

	let currentStep = 1;
	console.log();
	console.log(chalk.bold("Summoning complete. Next steps:"));
	console.log();
	console.log(
		`  ${currentStep}. Enter your package directory using ${chalk.magentaBright(`cd ${toSlug(summonConfig.name)}`)}`,
	);
	currentStep += 1;

	console.log(
		`  ${currentStep}. Push your initial commit with ${chalk.magentaBright("git push -u origin main")}`,
	);
	currentStep += 1;

	if (githubSecrets.length > 0) {
		console.log(
			`  ${currentStep}. Configure the following repository secrets in your GitHub project :`,
		);
		currentStep += 1;
		githubSecrets.forEach((secret) => {
			console.log(`    - ${chalk.magentaBright(secret)}`);
		});
	}

	console.log(
		`  ${currentStep}. Install dependencies with ${chalk.magentaBright(installCmd)}`,
	);
	currentStep += 1;

	console.log(`  ${currentStep}. Happy building, fellow wizard!`);

	console.log();
	console.log(
		`Stuck? Open an issue at ${chalk.magentaBright("https://github.com/agrawal-rohit/grimoire/issues")}`,
	);
	console.log();
}

export default runSummonPackage;
