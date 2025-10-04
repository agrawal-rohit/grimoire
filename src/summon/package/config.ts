import chalk from "chalk";
import prompts from "../../cli/prompts";
import tasks from "../../cli/tasks";
import { IS_LOCAL_MODE } from "../../core/constants";
import { getGitEmail, getGitUsername } from "../../core/git";
import {
	LANGUAGE_PACKAGE_REGISTRY,
	validatePackageName,
} from "../../core/pkg-manager";
import { listAvailableTemplates } from "../../core/template-registry";
import { capitalizeFirstLetter, toSlug } from "../../core/utils";

/** Supported programming languages for the package. */
export enum Language {
	TYPESCRIPT = "typescript",
}

export const templatePublicPaths: Record<Language | "shared", string[]> = {
	shared: [
		"CODE_OF_CONDUCT.md",
		"CONTRIBUTING.md",
		"issue_template",
		"pull_request_template.md",
	],
	[Language.TYPESCRIPT]: ["release.config.cjs"],
};

/** Describes the configuration for summoning a package. */
export type SummonPackageConfiguration = {
	/** The selected programming language for the package. */
	lang: Language;
	/** The package name. */
	name: string;
	/** The chosen template for the package. */
	template: string;
	/** Indicates whether the package should be published to a public registry. */
	public: boolean;
	/** Optional full name of the author (Only required for public packages). */
	authorName?: string;
	/** Optional Git username (Only required for public packages). */
	authorGitUsername?: string;
	/** Optional Git email address (Only required for public packages). */
	authorGitEmail?: string;
};

/**
 * Gather relevant configuration to proceed with the package creation
 * @returns A JSON object with the package configuration
 */
export async function getSummonPackageConfiguration(
	cliFlags: Partial<SummonPackageConfiguration> = {},
): Promise<SummonPackageConfiguration> {
	const lang = await getPackageLanguage(cliFlags);
	const name = await getPackageName(lang, cliFlags);
	const template = await getPackageTemplate(lang, cliFlags);
	const isPublic = await getPackageVisibility(lang, cliFlags);

	let authorName: string | undefined;
	let authorGitEmail: string | undefined;
	let authorGitUsername: string | undefined;
	if (isPublic) {
		authorName = await promptAuthorName();
		authorGitEmail = await promptAuthorGitEmail();
		authorGitUsername = await promptAuthorGitUsername();
	}

	const answers: SummonPackageConfiguration = {
		lang: lang,
		name: name,
		template: template,
		public: isPublic,
		authorName: authorName,
		authorGitEmail: authorGitEmail,
		authorGitUsername: authorGitUsername,
	};

	return answers;
}

/**
 * Gets the package language based on CLI flags or prompts the user if not provided.
 * @param cliFlags - CLI flags that may include a predefined language selection.
 * @returns The selected programming language type.
 */
export async function getPackageLanguage(
	cliFlags: Partial<SummonPackageConfiguration> = {},
): Promise<SummonPackageConfiguration["lang"]> {
	const languageOptions = Object.keys(Language).map((key: string) => ({
		label: capitalizeFirstLetter(Language[key as keyof typeof Language]),
		value: Language[key as keyof typeof Language],
	}));

	const language =
		cliFlags.lang ??
		(await prompts.selectInput<Language>(
			"Which language would you prefer to use?",
			{
				options: languageOptions,
			},
			Language.TYPESCRIPT,
		));

	const validLanguages = new Set<string>(
		languageOptions.map((opt) => opt.value),
	);
	if (!validLanguages.has(language))
		throw new Error(
			`Unsupported language: ${language} (valid: ${Array.from(validLanguages).join(", ")})`,
		);

	return language;
}

/**
 * Gets the package name based on CLI flags or prompts the user if not provided.
 * Also validates the package name against the selected language.
 * @param language - The selected programming language.
 * @param cliFlags - CLI flags that may include a predefined name.
 * @returns The validated package name.
 */
export async function getPackageName(
	language: Language,
	cliFlags: Partial<SummonPackageConfiguration> = {},
): Promise<SummonPackageConfiguration["name"]> {
	const name =
		cliFlags.name ??
		(await prompts.textInput(
			"What should we call your package?",
			{ required: true },
			"my-package",
		));

	validatePackageName(name, language);

	return name;
}

export async function getPackageTemplate(
	language: Language,
	cliFlags: Partial<SummonPackageConfiguration> = {},
): Promise<SummonPackageConfiguration["template"]> {
	let candidateTemplates: string[] = [];

	// If it's not running with local mode, then show a loading spinner until the templates are fetched from Github
	if (!IS_LOCAL_MODE) {
		console.log();
		await tasks.runWithTasks(
			"Checking available package templates",
			async () => {
				candidateTemplates = await listAvailableTemplates(language, "package");
			},
		);
	}

	// In local mode, the templates are fetched from the file system which is a pretty quick operation
	else {
		candidateTemplates = await listAvailableTemplates(language, "package");
	}

	if (!candidateTemplates || candidateTemplates.length === 0)
		throw new Error(`No templates found for language: ${language}`);

	const templateOptions = candidateTemplates.map((template) => ({
		label: capitalizeFirstLetter(template),
		value: template,
	}));

	let template = cliFlags.template;

	// If only a single template is available, just use that
	if (templateOptions.length === 1) {
		template = templateOptions[0].value;
		console.log(
			chalk.magentaBright(
				`(Only one package template is available, using "${template}".)`,
			),
		);
	}

	if (!template)
		template = await prompts.selectInput<string>(
			"Which starter template would you like to use?",
			{ options: templateOptions },
			candidateTemplates[0],
		);

	if (!candidateTemplates.includes(template))
		throw new Error(
			`Unsupported template: ${template} (valid: ${Array.from(candidateTemplates).join(", ")})`,
		);

	return template;
}

/**
 * Gets the package visibility (public or private) based on CLI flags or prompts the user if not provided.
 * Uses the package registry for the selected language in the prompt.
 * @param language - The selected programming language.
 * @param cliFlags - CLI flags that may include a predefined visibility setting.
 * @returns The boolean indicating if the package is public.
 */
export async function getPackageVisibility(
	language: Language,
	cliFlags: Partial<SummonPackageConfiguration> = {},
): Promise<SummonPackageConfiguration["public"]> {
	const packageRegistry = LANGUAGE_PACKAGE_REGISTRY[language];
	const isPublic =
		cliFlags.public ??
		(await prompts.confirmInput(
			`Would this be a public package (released to the ${packageRegistry} registry)`,
			undefined,
			true,
		));

	return isPublic;
}

/** Prompt for author's full name (defaults to Git config when available). */
export async function promptAuthorName(): Promise<string> {
	const gitName = await getGitUsername();
	return await prompts.textInput(
		"What's your name? (Will be used for communication and licensing)",
		undefined,
		gitName,
	);
}

/** Prompt for author's Git email (defaults to Git config when available). */
export async function promptAuthorGitEmail(): Promise<string> {
	const inferredGitEmail = await getGitEmail();
	return await prompts.textInput(
		"What's your email? (Will be used for communication)",
		undefined,
		inferredGitEmail,
	);
}

/** Prompt for author's GitHub username (suggests a value based on Git name). */
export async function promptAuthorGitUsername(): Promise<string> {
	const gitName = await getGitUsername();
	const suggestedUsername = gitName
		? gitName.toLowerCase().replace(/\s+/g, "")
		: undefined;

	const finalGitUserName = await prompts.textInput(
		"What's your GitHub username? (Will be used for communication links and status badges)",
		undefined,
		suggestedUsername,
	);

	return toSlug(finalGitUserName);
}
