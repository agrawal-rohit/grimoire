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
		/** Target application framework. */
		framework: TargetFramework;
	};
	/** Details about project integration preferences. */
	tooling: {
		/** Enable pre-commit hooks to enforce Conventional Commits (husky + commitlint) */
		precommitHooks: boolean;

		/** GitHub repository configuration (.github) */
		github: {
			/** Add CI/CD workflows (build, test, release) modeled after this template */
			workflows: boolean;
			/** Add issue and PR templates */
			templates: boolean;
			/** Add Dependabot configuration */
			dependabot: boolean;
		};

		/** Code quality and coverage reporting via Codacy */
		codacy: boolean;

		/** Styling solution for UI components (only relevant for React libraries). */
		styling: Styling;

		/** Community health files auto-generation */
		community: {
			codeOfConduct: boolean;
			contributing: boolean;
			license: boolean;
			readme: boolean;
		};
	};
	/** Optional author identification details */
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

/**  */
export enum PackageManager {
	NPM = "npm",
	YARN = "yarn",
	PNPM = "pnpm",
	BUN = "bun",
}

export enum TargetFramework {
	NONE = "none",
	REACT = "React",
}

export enum Styling {
	NONE = "none",
	TAILWINDCSS = "Tailwind CSS",
}
