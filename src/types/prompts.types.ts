import type { PackageManager } from "./package-manager.types";

/** Describes the aggregated answers collected from prompts. */
export type PromptAnswers = {
	/** Basic project details provided by the user. */
	project: {
		/** The user's display name. */
		name: string;
		/** Optional short description or bio. */
		description?: string;
		/** Selected package manager (e.g., npm, yarn, pnpm). */
		packageManager: PackageManager;
		/** Indicates whether the package should be published to npm. */
		shouldReleaseToNPM: boolean;
		/** Indicates if this is a ReactJS library. */
		isReactLibrary: boolean;
	};
	/** Details about project integration preferences. */
	/** Details about project integration preferences. */
	tooling: {
		/** Initialize a git repository */
		initGit: boolean;

		/** Enable pre-commit hooks to enforce Conventional Commits (husky + commitlint) */
		precommitHooks: boolean;

		/** Install dependencies after scaffolding completes */
		installDependencies: boolean;

		/** GitHub related scaffold (.github) */
		github: {
			/** Add CI/CD workflows (build, test, release) modeled after this template */
			workflows: boolean;
			/** Add issue templates */
			issueTemplates: boolean;
			/** Add Dependabot configuration */
			dependabot: boolean;
		};

		/** Code quality and coverage reporting via Codacy */
		codacy: boolean;

		/** TailwindCSS integration for React libraries */
		tailwindCSS: boolean;

		/** Community health files auto-generation */
		community: {
			codeOfConduct: boolean;
			contributing: boolean;
			license: boolean;
			readme: boolean;
		};
	};
	/** Optional author identification details used for scaffolding. */
	author: {
		/** Optional full name of the author. */
		name?: string;
		/** Optional Git username (e.g., GitHub user). */
		gitUsername?: string;
		/** Optional email address for the author's Git configuration. */
		gitEmail?: string;
		/** Optional npm username associated with the author. */
		npmUsername?: string;
	};
};
