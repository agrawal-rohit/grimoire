import { PackageManager } from "../types/package-manager.types";
import type { PromptAnswers } from "../types/prompts.types";
import { getGitEmail, getGitUsername } from "../utils/git.utils";
import { validatePackageName } from "../utils/package-manager.utils";
import cli from "./cli";

/**
 * Gather relevant configuration to proceed with the library creation
 * @returns A JSON object with the library configuration
 */
export async function getSetupConfiguration(): Promise<PromptAnswers> {
	cli.header("let's start with the basics");
	const project = await promptProjectInputs();

	cli.header("let's pick what we need");
	const tooling = await promptToolingInputs(project);

	cli.header("let's get to know you");
	const author = await promptAuthorInputs(project);

	const answers: PromptAnswers = {
		project,
		tooling,
		author,
	};

	return answers;
}

/**
 * Prompts the user for basic project information including name and description.
 * Validates the package name and throws an error if invalid.
 * @returns The project configuration object with name and description.
 */
export async function promptProjectInputs(): Promise<PromptAnswers["project"]> {
	const name = await cli.textInput(
		"What should we call your library?",
		{
			validate: (val: string) =>
				val.length ? undefined : "Library name is required",
		},
		"my-lib",
	);

	// Validate the final lib name
	const validation = validatePackageName(name);
	if (validation !== true) {
		throw new Error(
			typeof validation === "string" ? validation : "Invalid package name",
		);
	}

	const description = await cli.textInput("What would it do?", {
		placeholder: "Short description of the library",
	});

	const packageManager = await cli.selectInput<PackageManager>(
		"Any preferred package manager?",
		{
			options: [
				{ label: "pnpm", value: PackageManager.PNPM, hint: "Default" },
				{ label: "npm", value: PackageManager.NPM },
				{ label: "yarn", value: PackageManager.YARN },
				{ label: "bun", value: PackageManager.BUN },
			],
		},
		PackageManager.PNPM,
	);

	const isReactLibrary = await cli.confirmInput(
		"Is this a React library?",
		undefined,
		false,
	);

	const shouldReleaseToNPM = await cli.confirmInput(
		"Would this be released to NPM?",
		undefined,
		true,
	);

	return {
		name,
		description,
		packageManager,
		shouldReleaseToNPM,
		isReactLibrary,
	};
}

/**
 * Prompts the user for tooling preferences such as package manager, git initialization, and NPM release.
 * @returns The tooling configuration object.
 */
export async function promptToolingInputs(
	project: PromptAnswers["project"],
): Promise<PromptAnswers["tooling"]> {
	// TailwindCSS (only relevant for React libs)
	let tailwindCSS = false;
	if (project.isReactLibrary) {
		tailwindCSS = await cli.confirmInput(
			"Do you need TailwindCSS for styling?",
			undefined,
			true,
		);
	}
	const precommitHooks = await cli.confirmInput(
		"Do you want to use pre-commit hooks (for commit linting and pre-commit checks)?",
		undefined,
		true,
	);

	const codacyEnabled = await cli.confirmInput(
		"Do you want to use Codacy (for code quality & coverage)?",
		undefined,
		true,
	);

	const githubChoices = await cli.multiselectInput(
		"Would you like any repository helpers?",
		{
			options: [
				{
					value: "workflows",
					label: `CI/CD workflows`,
					hint: "for build and release automation",
				},
				{
					value: "issue-templates",
					label: "Issue templates",
					hint: "for bug reports/features",
				},
				{
					value: "dependabot",
					label: "Dependabot",
					hint: "dependency upgrades",
				},
			],
			required: false,
		},
		["workflows", "issue-templates", "dependabot"],
	);

	// Community health files (only when releasing to NPM)
	let community = {
		codeOfConduct: false,
		contributing: false,
		license: false,
		readme: false,
	};
	if (project.shouldReleaseToNPM) {
		const communityChoices = await cli.multiselectInput(
			"Which community files do you need?",
			{
				options: [
					{
						value: "code-of-conduct",
						label: "CODE_OF_CONDUCT.md",
						hint: "community guidelines",
					},
					{
						value: "contributing",
						label: "CONTRIBUTING.md",
						hint: "guidelines for contributors",
					},
					{ value: "license", label: "LICENSE", hint: "MIT" },
					{
						value: "readme",
						label: "README.md",
						hint: "project documentation",
					},
				],
				required: false,
			},
			["code-of-conduct", "contributing", "license", "readme"],
		);
		community = {
			codeOfConduct: communityChoices.includes("code-of-conduct"),
			contributing: communityChoices.includes("contributing"),
			license: communityChoices.includes("license"),
			readme: communityChoices.includes("readme"),
		};
	}

	const installDependencies = await cli.confirmInput(
		"Do you want to install the dependencies immediately?",
		undefined,
		true,
	);

	const githubWorkflows = githubChoices.includes("workflows");
	const githubIssueTemplates = githubChoices.includes("issue-templates");
	const githubDependabot = githubChoices.includes("dependabot");

	return {
		// git is initialized by default during setup; keep this true to reflect behavior
		initGit: true,
		precommitHooks,
		installDependencies,
		github: {
			workflows: githubWorkflows,
			issueTemplates: githubIssueTemplates,
			dependabot: githubDependabot,
		},
		codacy: codacyEnabled,
		tailwindCSS,
		community,
	};
}

/**
 * Prompts the user for author information, inferring from git config where possible.
 * Only prompts for GitHub and NPM usernames if relevant based on tooling.
 * @param tooling - The tooling configuration to determine which fields to prompt for.
 * @returns The author configuration object.
 */
export async function promptAuthorInputs(
	project: PromptAnswers["project"],
): Promise<PromptAnswers["author"]> {
	const gitName = getGitUsername();
	const inferredGitEmail = getGitEmail();

	const suggestedUsername = gitName
		? gitName.toLowerCase().replace(/\s+/g, "")
		: undefined;

	// Author name
	const authorName = await cli.textInput(
		"What's your name?",
		undefined,
		gitName,
	);

	// Author email
	const gitEmail = await cli.textInput(
		"What's your email?",
		undefined,
		inferredGitEmail,
	);

	// GitHub username
	const githubUsername = await cli.textInput(
		"What's your GitHub username?",
		undefined,
		suggestedUsername,
	);

	// NPM username
	let npmUsername: string | undefined;
	if (project.shouldReleaseToNPM) {
		npmUsername = await cli.textInput(
			"What's your NPM username?",
			undefined,
			suggestedUsername,
		);
	}

	return {
		name: authorName,
		gitUsername: githubUsername,
		gitEmail: gitEmail,
		npmUsername: npmUsername,
	};
}
