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
  cli.header("[1/3] what are you building");
  const project = await promptProjectInputs();

  cli.header("[2/3] what do you need");
  const tooling = await promptToolingInputs();

  cli.header("[3/3] wrapping it up");
  const author = await promptAuthorInputs();

  const answers: PromptAnswers = {
    project,
    tooling,
    author,
  };

  return answers;
}

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

export async function promptAuthorInputs(): Promise<PromptAnswers["author"]> {
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
  const githubUsername = await cli.textInput(
    "What's your GitHub username?",
    undefined,
    suggestedUsername
  );

  // NPM username
  const npmUsername = await cli.textInput(
    "What's your NPM username?",
    undefined,
    suggestedUsername
  );

  return {
    name: authorName,
    gitUsername: githubUsername,
    gitEmail: gitEmail,
    npmUsername: npmUsername,
  };
}
