import type { PackageManager } from "./package-manager.types";

/** Describes the aggregated answers collected from prompts. */
export type PromptAnswers = {
  /** Basic project details provided by the user. */
  project: {
    /** The user's display name. */
    name: string;
    /** Optional short description or bio. */
    description?: string;
  };
  /** Details about project tooling preferences. */
  tooling: {
    /** Selected package manager (e.g., npm, yarn, pnpm). */
    packageManager: PackageManager;
    /** Indicates whether a git repository should be initialized. */
    shouldInitializeGit: boolean;
    /** Indicates whether the package should be published to npm. */
    shouldReleaseToNPM: boolean;
  };
  // integrations: {};
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
