import cac from "cac";
import logger from "./cli/logger";
import runSummonPackage from "./summon";
import type { SummonPackageConfiguration } from "./summon/package/config";

/** Root CLI entrypoint for grimoire. */
export function buildCli() {
	const app = cac("grimoire");

	// Top-level description
	app.usage("summon <resource> [options]");

	// Summon command with resource routing
	app
		.command("summon [resource]", "Summon a resource")
		.option("--lang <lang>", "Target language (e.g., typescript)")
		.option("--name <name>", "Package name")
		.option("--template <template>", "Starter template for the package")
		.option("--public", "Mark as public (will setup for publishing)")
		.action(
			async (
				resource: string | undefined,
				options: Partial<SummonPackageConfiguration>,
			) => {
				try {
					if (!resource) {
						console.log("Usage: grimoire summon <resource>\n");
						console.log("Available resources:");
						console.log("  package   Create a new package");
						return;
					}

					switch (resource) {
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

	app.help();

	return app;
}

export default function run(argv: string[] = process.argv): void {
	const app = buildCli();

	// Parse argv and, on parse errors, re-run with contextual --help (no hardcoded commands)
	const args = (Array.isArray(argv) ? argv.slice(2) : []).filter(Boolean);
	if (args.length === 0) {
		app.outputHelp();
		return;
	}

	try {
		app.parse(argv);
	} catch {
		// Show help for the attempted command by appending --help to the original args
		const fallbackArgv = [argv[0] || "", argv[1] || "", ...args, "--help"];
		try {
			app.parse(fallbackArgv);
		} catch {
			// Final fallback: show top-level help
			app.outputHelp();
		}
	}
}
