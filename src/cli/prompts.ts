import cliHelper from "../core/cli-helper";
import { getGitEmail, getGitUsername } from "../core/git";
import { PackageManager, type PromptAnswers } from "../core/types";
import { validateLibraryName } from "../utils/setup-utils";

/**
 * Gather relevant configuration to proceed with the library creation
 * @returns A JSON object with the library configuration
 */
export async function getSetupConfiguration(): Promise<PromptAnswers> {
  cliHelper.header("[1/3] what are you building");
  const basicDetails = await promptLibraryDetails();

  cliHelper.header("[2/3] what do you need");
  const projectDetails = await promptProjectDetails();

  cliHelper.header("[3/3] wrapping it up");
  const authorDetails = await promptAuthorDetails();

  const answers: PromptAnswers = {
    basicDetails,
    projectDetails,
    authorDetails,
  };

  return answers;
}

export async function promptLibraryDetails(): Promise<
  PromptAnswers["basicDetails"]
> {
  const name = await cliHelper.textInput(
    "What should we call your library?",
    {
      validate: (val: string) =>
        val.length ? undefined : "Library name is required",
    },
    "my-lib"
  );

  // Validate the final lib name
  const validation = validateLibraryName(name);
  if (validation !== true) {
    throw new Error(
      typeof validation === "string" ? validation : "Invalid package name"
    );
  }

  const description = await cliHelper.textInput("What would it do?", {
    placeholder: "Short description of the library",
  });

  return {
    name,
    description,
  };
}

export async function promptProjectDetails(): Promise<
  PromptAnswers["projectDetails"]
> {
  const packageManager = await cliHelper.selectInput<PackageManager>(
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

  const shouldInitializeGit = await cliHelper.confirmInput(
    "Initialize a new git repository?",
    {
      initialValue: true,
    }
  );

  const shouldReleaseToNPM = await cliHelper.confirmInput(
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

export async function promptAuthorDetails(): Promise<
  PromptAnswers["authorDetails"]
> {
  const gitName = getGitUsername();
  const inferredGitEmail = getGitEmail();

  const suggestedUsername = gitName
    ? gitName.toLowerCase().replace(/\s+/g, "")
    : undefined;

  // Author name
  const authorName = await cliHelper.textInput(
    "What's your name?",
    undefined,
    gitName
  );

  // Author email
  const gitEmail = await cliHelper.textInput(
    "What's your email?",
    undefined,
    inferredGitEmail
  );

  // GitHub username
  const githubUsername = await cliHelper.textInput(
    "What's your GitHub username?",
    undefined,
    suggestedUsername
  );

  // NPM username
  const npmUsername = await cliHelper.textInput(
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
