import cac from "cac";
import { registerResourcesCli } from "./resources";

export default function run(): void {
	const app = cac("yehle");

	// Register commands
	registerResourcesCli(app);

	// Register the help command
	app.help();

	// Parse argv and, on parse errors, re-run with contextual --help
	const args = process.argv.slice(2).filter(Boolean);

	// Show global help when just the root command is called
	if (args.length === 0) {
		app.outputHelp();
		return;
	}

	// Attempt to run the command
	try {
		app.parse(process.argv);
	} catch {
		// If the command failed (due to incorrect arguments, missing commands, etc)
		// Attempt to show help for the command by appending --help to the original args
		try {
			app.parse([...process.argv, "--help"]);
		} catch {
			// Final fallback: show top-level help
			app.outputHelp();
		}
	}
}
