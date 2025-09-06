export type PromptAnswers = {
  basicDetails: {
    name: string;
    description?: string;
  };
  projectDetails: {
    packageManager: string;
    shouldInitializeGit: boolean;
    shouldReleaseToNPM: boolean;
  };
  authorDetails: {
    name?: string;
    gitUsername?: string;
    gitEmail?: string;
    npmUsername?: string;
  };
};

export enum PackageManager {
  NPM = "npm",
  YARN = "yarn",
  PNPM = "pnpm",
  BUN = "bun",
}
