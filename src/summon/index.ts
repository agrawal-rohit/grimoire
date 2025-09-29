import type { CAC } from "cac";
import logger from "../cli/logger";
import runSummonPackage from "./package/command";
import type { SummonPackageConfiguration } from "./package/config";

export async function registerSummonCli(app: CAC) {
	// Top-level description
	app.usage("summon <resource> [options]");

	// Summon command with resource routing
	app
		.command("summon [resource]", "Summon a resource")
		.option("--name <name>", "Package name")
		.option("--lang <lang>", "Target language (e.g., typescript)")
		.option(
			"--public",
			"Public package (will setup for publishing to a package registry)",
		)
		.option("--template <template>", "Starter template for the package")
		.action(
			async (
				resource: string | undefined,
				options: Partial<SummonPackageConfiguration>,
			) => {
				try {
					switch (resource) {
						// Summon a package
						case "package": {
							await runSummonPackage({
								lang: options.lang,
								name: options.name,
								template: options.template,
								public: options.public ? Boolean(options.public) : undefined,
							});
							break;
						}

						default: {
							console.log("Usage: grimoire summon <resource>\n");
							console.log("Available resources:");
							console.log("  package   Create a new package");
						}
					}
				} catch (err) {
					const msg = err instanceof Error ? err.message : String(err);
					logger.error(msg);
				}
			},
		);
}
