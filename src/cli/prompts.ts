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
  const tooling = await promptToolingInputs();

  let author: PromptAnswers["author"] = {};
  if (tooling.shouldInitializeGit || tooling.shouldReleaseToNPM) {
    cli.header("let's get to know you");
    author = await promptAuthorInputs(tooling);
  }

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
    "my-lib"
  );

  // Validate the final lib name
  const validation = validatePackageName(name);
  if (validation !== true) {
    throw new Error(
      typeof validation === "string" ? validation : "Invalid package name"
    );
  }

  const description = await cli.textInput("What would it do?", {
    placeholder: "Short description of the library",
  });

  return {
    name,
    description,
  };
}

/**
 * Prompts the user for tooling preferences such as package manager, git initialization, and NPM release.
 * @returns The tooling configuration object.
 */
export async function promptToolingInputs(): Promise<PromptAnswers["tooling"]> {
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
    PackageManager.PNPM
  );

  const shouldInitializeGit = await cli.confirmInput(
    "Initialize a new git repository?",
    {
      initialValue: true,
    }
  );

  const shouldReleaseToNPM = await cli.confirmInput(
    "Would this be released to NPM?",
    {
      initialValue: true,
    }
  );

  return {
    packageManager,
    shouldInitializeGit,
    shouldReleaseToNPM,
  };
}

/**
 * Prompts the user for author information, inferring from git config where possible.
 * Only prompts for GitHub and NPM usernames if relevant based on tooling.
 * @param tooling - The tooling configuration to determine which fields to prompt for.
 * @returns The author configuration object.
 */
export async function promptAuthorInputs(
  tooling: PromptAnswers["tooling"]
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
    gitName
  );

  // Author email
  const gitEmail = await cli.textInput(
    "What's your email?",
    undefined,
    inferredGitEmail
  );

  // GitHub username
  let githubUsername: string | undefined;
  if (tooling.shouldInitializeGit) {
    githubUsername = await cli.textInput(
      "What's your GitHub username?",
      undefined,
      suggestedUsername
    );
  }

  // NPM username
  let npmUsername: string | undefined;
  if (tooling.shouldReleaseToNPM) {
    npmUsername = await cli.textInput(
      "What's your NPM username?",
      undefined,
      suggestedUsername
    );
  }

  return {
    name: authorName,
    gitUsername: githubUsername,
    gitEmail: gitEmail,
    npmUsername: npmUsername,
  };
}
