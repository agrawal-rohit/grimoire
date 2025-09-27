import prompts from "../../cli/prompts";
import { getGitEmail, getGitUsername } from "../../core/git";
import {
	LANGUAGE_PACKAGE_REGISTRY,
	validatePackageName,
} from "../../core/pkg-manager";
import { capitalizeFirstLetter } from "../../core/utils";
import { assertSupportedTemplate, listPackageTemplates } from "./registry";

/** Supported programming languages for the package. */
export enum Language {
	TYPESCRIPT = "typescript",
}

/** Describes the configuration for summoning a package. */
export type SummonPackageConfiguration = {
	/** The selected programming language for the package. */
	lang: Language;
	/** The user's display name. */
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
	/** Optional packager registry username (Only required for public packages). */
	authorPackageRegistryUsername?: string;
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
	let authorPackageRegistryUsername: string | undefined;
	if (isPublic) {
		authorName = await promptAuthorName();
		authorGitEmail = await promptAuthorGitEmail();
		authorGitUsername = await promptAuthorGitUsername();
		authorPackageRegistryUsername =
			await promptAuthorPackageRegistryUsername(lang);
	}

	const answers: SummonPackageConfiguration = {
		lang: lang,
		name: name,
		template: template,
		public: isPublic,
		authorName: authorName,
		authorGitEmail: authorGitEmail,
		authorGitUsername: authorGitUsername,
		authorPackageRegistryUsername: authorPackageRegistryUsername,
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
		throw new Error(`Unsupported language: ${language}`);

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
	const candidateTemplates = await listPackageTemplates(language);

	if (!candidateTemplates || candidateTemplates.length === 0)
		throw new Error(`No templates found for language: ${language}`);

	const templateOptions = candidateTemplates.map((template) => ({
		label: capitalizeFirstLetter(template),
		value: template,
	}));

	let template = cliFlags.template;
	if (templateOptions.length < 2) template = templateOptions[0].value;
	if (!template)
		template = await prompts.selectInput<string>(
			"Which starter template would you like to use?",
			{ options: templateOptions },
			candidateTemplates[0],
		);

	await assertSupportedTemplate(language, template, "package");

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
	return await prompts.textInput("What's your name?", undefined, gitName);
}

/** Prompt for author's Git email (defaults to Git config when available). */
export async function promptAuthorGitEmail(): Promise<string> {
	const inferredGitEmail = await getGitEmail();
	return await prompts.textInput(
		"What's your email?",
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

	return await prompts.textInput(
		"What's your GitHub username?",
		undefined,
		suggestedUsername,
	);
}

/** Prompt for author's package registry username (e.g., NPM for TypeScript). */
export async function promptAuthorPackageRegistryUsername(
	language: Language,
): Promise<string> {
	const gitName = await getGitUsername();
	const suggestedUsername = gitName
		? gitName.toLowerCase().replace(/\s+/g, "")
		: undefined;
	const registry = LANGUAGE_PACKAGE_REGISTRY[language];

	return await prompts.textInput(
		`What's your ${registry} username?`,
		undefined,
		suggestedUsername,
	);
}
