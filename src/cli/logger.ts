import chalk from "chalk";
import animatedIntro from "./animated-intro";

/** Logger utilities for the CLI. */
export class Logger {
	/**
	 * Prints an introductory message with a "grimoire" badge.
	 * @param message - The introductory message to display.
	 */
	async intro(message: string): Promise<void> {
		await animatedIntro(message);
	}

	/**
	 * Prints an error message with a red background prefix and exits the process with code 1.
	 * @param message - The error message to display.
	 */
	error(message: string) {
		console.log();
		console.error(`${chalk.bgRed(" error ")} ${message}`);
		console.log();
		process.exit(1);
	}

	/**
	 * Prints an end message with a red background prefix and exits the process with code 0.
	 * @param message - The end message to display.
	 */
	end(message: string) {
		console.log();
		console.error(`${chalk.bgRed(" end ")} ${message}`);
		console.log();
		process.exit(0);
	}
}

const logger = new Logger();
export default logger;
