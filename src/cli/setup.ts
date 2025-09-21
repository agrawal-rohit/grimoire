import { PackageManager } from "../types/package-manager.types";
import { initGitRepo } from "../utils/git.utils";
import { ensurePackageManager } from "../utils/package-manager.utils";
import { createProjectDirectory, writePackageJson } from "../utils/setup.utils";
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

	// 1) Gather setup answers
	const answers = await getSetupConfiguration();

	cli.outro("");

	// 2) Preparing project
	let targetDir: string = "";
	let isEmpty: boolean = true;

	await cli.withTasks("Preparing project", [
		{
			title: "Ensure directory",
			task: async () => {
				const result = createProjectDirectory(
					process.cwd(),
					answers.project.name,
				);
				targetDir = result.targetDir;
				isEmpty = result.isEmpty;
			},
		},
		{
			title: "Initialize git",
			task: async () => {
				initGitRepo(targetDir);
			},
		},
	]);

	if (!isEmpty) {
		throw new Error(`Target directory is not empty: ${targetDir}`);
	}

	// 3) Installing tooling
	let packageManagerVersion: string = "";
	await cli.withTasks("Installing tooling", [
		{
			title: "Ensure package manager",
			task: async () => {
				packageManagerVersion = ensurePackageManager(
					answers.project.packageManager ?? PackageManager.PNPM,
				);
			},
		},
	]);

	// 4) Writing project metadata
	await cli.withTasks("Writing project metadata", [
		{
			title: "Create package.json",
			task: async () => {
				writePackageJson(targetDir, answers, packageManagerVersion);
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
