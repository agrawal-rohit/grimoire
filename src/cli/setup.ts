import cliHelper from "../core/cli-helper";
import { getSetupConfiguration } from "./prompts";

async function run(): Promise<void> {
  // Begin intro
  cliHelper.intro("Let's get started...");

  // Get setup values for the library
  const answers = await getSetupConfiguration();

  console.log(JSON.stringify({ answers }, undefined, 2));
}

// Only run when invoked directly
if (require.main === module) {
  run().catch((err) => {
    cliHelper.error(err);
  });
}

export default run;
