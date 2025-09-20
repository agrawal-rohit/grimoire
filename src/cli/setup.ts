import { PackageManager } from "../types/package-manager.types";
import { initGitRepo } from "../utils/git.utils";
import { ensurePackageManager } from "../utils/package-manager.utils";
import { createProjectDirectory, writePackageJson } from "../utils/setup.utils";
import cli from "./cli";
import { getSetupConfiguration } from "./prompts";

async function runSetup(): Promise<void> {
  cli.intro("Let's get started...");

  // 1) Gather setup answers
  const answers = await getSetupConfiguration();

  // 2) Preparing project
  const { targetDir, isEmpty } = await cli.withSpinner(
    "Preparing project",
    async () => {
      const result = createProjectDirectory(
        process.cwd(),
        answers.project.name
      );

      if (answers.tooling.shouldInitializeGit) initGitRepo(result.targetDir);

      return result;
    },
    "Project prepared"
  );
  if (!isEmpty) {
    throw new Error(`Target directory is not empty: ${targetDir}`);
  }

  // 3) Installing tooling (package manager)
  let packageManagerVersion = ensurePackageManager(PackageManager.PNPM);
  await cli.withSpinner(
    "Installing tooling",
    async () => {
      packageManagerVersion = ensurePackageManager(
        answers.tooling.packageManager
      );
    },
    "Tooling ready"
  );

  // 4) Writing project metadata (package.json)
  await cli.withSpinner(
    "Writing project metadata",
    async () => writePackageJson(targetDir, answers, packageManagerVersion),
    "Project metadata written"
  );
}

// Only run when invoked directly
if (require.main === module) {
  runSetup().catch((err) => {
    cli.error(err instanceof Error ? err.message : String(err));
  });
}

export default runSetup;
