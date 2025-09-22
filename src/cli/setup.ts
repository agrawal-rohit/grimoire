import fs from "node:fs";
import {
	PackageManager,
	Styling,
	TargetFramework,
} from "../types/prompts.types";
import { initGitRepo } from "../utils/git.utils";
import {
	ensurePackageManager,
	installAllDependencies,
} from "../utils/pkg-manager.utils";
import {
	configurePrecommit,
	configureRelease,
	configureStyling,
	configureTargetFramework,
	createProjectDirectory,
	writeCommonConfig,
	writePackageJson,
	writeStarterTemplate,
} from "../utils/setup.utils";
import cli from "./cli";
import { getSetupConfiguration } from "./prompts";

/**
 * Helper to create conditional tasks for cleaner task array building.
 * @param condition - Whether to include the task
 * @param title - Task title
 * @param task - Task function
 * @returns Array with task if condition is true, empty array otherwise
 */
function conditionalTask(
	condition: boolean,
	title: string,
	task: () => Promise<void>,
): Array<{ title: string; task: () => Promise<void> }> {
	return condition ? [{ title, task }] : [];
}

async function runSetup(): Promise<void> {
	cli.intro("");

	// Gather setup answers
	const answers = await getSetupConfiguration();

	// Check if project folder can be created
	let targetDir: string = "";
	let isEmpty: boolean = true;
	try {
		const files = fs.readdirSync(targetDir);
		isEmpty = files.length === 0;
	} catch {
		isEmpty = true;
	}

	if (!isEmpty) {
		throw new Error(`Target directory is not empty: ${targetDir}`);
	}

	cli.outro("Starting setup...");

	// Prepare project
	let packageManagerVersion: string = "";
	await cli.withTasks("Preparing project", [
		{
			title: "Create project directory",
			task: async () => {
				targetDir = await createProjectDirectory(
					process.cwd(),
					answers.project.name,
				);
			},
		},
		{
			title: "Initialize git repository",
			task: async () => {
				await initGitRepo(targetDir);
			},
		},
		{
			title: `Ensure ${answers.project.packageManager ?? PackageManager.PNPM} is installed`,
			task: async () => {
				packageManagerVersion = await ensurePackageManager(
					answers.project.packageManager ?? PackageManager.PNPM,
				);
			},
		},
		{
			title: "Create package.json",
			task: async () => {
				await writePackageJson(targetDir, answers, packageManagerVersion);
			},
		},
		{
			title: "Add common configuration",
			task: async () => {
				await writeCommonConfig(targetDir, answers);
			},
		},
		{
			title: "Add starter files and tests",
			task: async () => {
				await writeStarterTemplate(targetDir);
			},
		},
		...conditionalTask(
			answers.project.shouldReleaseToNPM,
			"Configuring setup for NPM release",
			async () => {
				await configureRelease(targetDir, answers);
			},
		),
		...conditionalTask(
			answers.tooling.precommitHooks,
			"Integrating pre-commit hooks",
			async () => {
				await configurePrecommit(targetDir, answers);
			},
		),
		...conditionalTask(
			answers.project.framework !== TargetFramework.NONE,
			`Add ${answers.project.framework} integration`,
			async () => {
				await configureTargetFramework(targetDir, answers);
			},
		),
		...conditionalTask(
			answers.tooling.styling !== Styling.NONE,
			`Add ${answers.tooling.styling} integration`,
			async () => {
				await configureStyling(targetDir, answers);
			},
		),
		{
			title: "Install all dependencies",
			task: async () => {
				await installAllDependencies(
					targetDir,
					answers.project.packageManager ?? PackageManager.PNPM,
				);
			},
		},
	]);
}

// Only run when invoked directly
if (require.main === module) {
	runSetup().catch((err) => {
		cli.error(err instanceof Error ? err.message : String(err));
	});
}

export default runSetup;
