import type { PromptAnswers } from "../types/prompts.types";
import {
	PackageManager,
	Styling,
	TargetFramework,
} from "../types/prompts.types";
import { validatePackageName } from "../utils/common.utils";
import { getGitEmail, getGitUsername } from "../utils/git.utils";
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

	const framework = await cli.selectInput<TargetFramework>(
		"Are you building for a particular framework?",
		{
			options: [
				{ label: "None", value: TargetFramework.NONE, hint: "Node" },
				{ label: "React", value: TargetFramework.REACT },
			],
		},
		TargetFramework.NONE,
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
		framework,
	};
}

/**
 * Prompts the user for tooling preferences such as package manager, git initialization, and NPM release.
 * @returns The tooling configuration object.
 */
export async function promptToolingInputs(
	project: PromptAnswers["project"],
): Promise<PromptAnswers["tooling"]> {
	// Styling framework (only relevant for non-node libraries)
	let styling: Styling = Styling.NONE;
	if (project.framework !== TargetFramework.NONE) {
		styling = await cli.selectInput<Styling>(
			"Do you have any preferred styling solution?",
			{
				options: [
					{ label: "None", value: Styling.NONE, hint: "Vanilla CSS" },
					{ label: "Tailwind CSS", value: Styling.TAILWINDCSS },
				],
			},
			Styling.TAILWINDCSS,
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
					label: `Github Actions workflows`,
					hint: "for build and release automation",
				},
				{
					value: "templates",
					label: "Github templates",
					hint: "for issues and pull requests",
				},
				{
					value: "dependabot",
					label: "Dependabot",
					hint: "dependency upgrades",
				},
			],
			required: false,
		},
		["workflows", "templates", "dependabot"],
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

	const githubWorkflows = githubChoices.includes("workflows");
	const githubTemplates = githubChoices.includes("templates");
	const githubDependabot = githubChoices.includes("dependabot");

	return {
		precommitHooks,
		github: {
			workflows: githubWorkflows,
			templates: githubTemplates,
			dependabot: githubDependabot,
		},
		codacy: codacyEnabled,
		styling,
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
	const gitName = await getGitUsername();
	const inferredGitEmail = await getGitEmail();

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
