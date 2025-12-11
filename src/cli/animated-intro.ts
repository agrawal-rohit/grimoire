import readline from "node:readline";
import chalk from "chalk";
import { stripAnsi } from "consola/utils";
import { sleep, truncate } from "../core/utils";

type Message = string | Promise<string>;

export type AnimatedIntroOptions = {
	title?: string;
	stdout?: NodeJS.WriteStream;

	/** Animation speed (ms per frame). Default: 150 */
	frameDelayMs?: number;

	// legacy (ignored)
	clear?: boolean;
	ascii?: boolean;
	stdin?: NodeJS.ReadStream;
	hat?: string;
	ribbon?: string;
};

export async function animatedIntro(
	msg: Message | Message[] = [],
	{
		title = "Grimoire",
		stdout = process.stdout,
		frameDelayMs = 150,
	}: AnimatedIntroOptions = {},
) {
	const messages = Array.isArray(msg) ? msg : [msg];

	// minimal TTY wiring (ESC to end, Ctrl+C to abort)
	const rl = readline.createInterface({
		input: process.stdin,
		escapeCodeTimeout: 50,
	});
	readline.emitKeypressEvents(process.stdin, rl);
	if (process.stdin.isTTY) process.stdin.setRawMode(true);

	const onKeypress = (_: string, key: readline.Key) => {
		if (key?.ctrl && key?.name === "c") {
			cleanup();
			process.exit(0);
		}
		if (key?.name === "escape") {
			cleanup();
		}
	};
	process.stdin.on("keypress", onKeypress);

	const cleanup = () => {
		if (process.stdin.isTTY) process.stdin.setRawMode(false);
		process.stdin.off("keypress", onKeypress);
		rl.close();
		renderer.finish();
	};

	/* ---------------- layout constants ---------------- */
	const label = chalk.bold(chalk.magentaBright(`${title}:`));
	const GAP = "  ";
	const LEFT_WIDTH = 13;
	const TOP = "╭─────┬─────╮";
	const BOT = "╰─────┴─────╯";

	// fixed-height renderer
	const renderer = createFixedHeightRenderer(stdout, 4);

	/* ---------------- rune set (simple only) ---------------- */
	const RUNES = ["*", "+", "x", "o"]; // <— simplified set
	const COLORS = [chalk.cyan, chalk.red, chalk.yellow, chalk.green, chalk.blue];

	function randomRune(): string {
		const r = RUNES[Math.floor(Math.random() * RUNES.length)];
		const c = COLORS[Math.floor(Math.random() * COLORS.length)];
		return c(r);
	}

	const center5 = (token: string) => {
		const raw = stripAnsi(token);
		const t = raw.length > 5 ? raw.slice(0, 5) : raw;
		const pad = 5 - t.length;
		const left = Math.floor(pad / 2);
		const right = pad - left;
		return " ".repeat(left) + token + " ".repeat(right);
	};

	const makeMid = (leftToken: string, rightToken: string) =>
		`│${center5(leftToken)}│${center5(rightToken)}│`; // 13 cols total

	function buildLines(
		l1: string,
		r1: string,
		l2: string,
		r2: string,
		rightTitle: string,
		rightMsg: string,
		rightWidth: number,
	): string[] {
		const left = [TOP, makeMid(l1, r1), makeMid(l2, r2), BOT];
		const paddedRight = ["", rightTitle, rightMsg, ""];
		const padLeft = (s: string) =>
			s + " ".repeat(Math.max(0, LEFT_WIDTH - stripAnsi(s).length));
		const padRight = (s: string) =>
			s + " ".repeat(Math.max(0, rightWidth - stripAnsi(s).length));
		return left.map((row, i) => padLeft(row) + GAP + padRight(paddedRight[i]));
	}

	for (const message of messages) {
		const resolvedMessage = Array.isArray(message)
			? await Promise.all(message)
			: await message;
		const words = Array.isArray(resolvedMessage)
			? resolvedMessage
			: String(resolvedMessage).split(" ");
		const finalMsg = words.join(" ");

		const columns = Math.max(40, stdout.columns || 80);
		const maxRight = Math.max(10, columns - LEFT_WIDTH - GAP.length - 2);
		const rightTitle = truncate(label, maxRight);
		const rightMsgFinal = truncate(finalMsg, maxRight);
		const RIGHT_WIDTH = Math.max(
			stripAnsi(rightTitle).length,
			stripAnsi(rightMsgFinal).length,
		);

		const spoken: string[] = [];

		for (const word of ["", ...words]) {
			if (word) spoken.push(word);

			// random, per-quadrant picks for a neutral, living feel
			const l1 = randomRune();
			const r1 = randomRune();
			const l2 = randomRune();
			const r2 = randomRune();

			const msgNow = truncate(spoken.join(" "), maxRight);
			const lines = buildLines(l1, r1, l2, r2, rightTitle, msgNow, RIGHT_WIDTH);
			renderer.paint(lines);

			await sleep(frameDelayMs);
		}

		// final calm frame: simple, balanced layout
		const lines = buildLines(
			chalk.cyanBright("*"),
			chalk.redBright("+"),
			chalk.yellowBright("x"),
			chalk.greenBright("o"),
			rightTitle,
			rightMsgFinal,
			RIGHT_WIDTH,
		);
		renderer.paint(lines);
		await sleep(200);
	}

	cleanup();
}

/* ---------------- fixed-height renderer ---------------- */
function createFixedHeightRenderer(out: NodeJS.WriteStream, height: number) {
	let initialized = false;
	return {
		paint(lines: string[]) {
			if (!initialized) {
				for (let i = 0; i < height; i++) {
					if (i) out.write("\n");
					out.write(lines[i]);
				}
				initialized = true;
				return;
			}

			out.write(`\x1b[${height - 1}F`);
			for (let i = 0; i < height; i++) {
				out.write("\x1b[2K");
				out.write(lines[i]);
				if (i < height - 1) out.write("\n");
			}
		},
		finish() {
			if (initialized) out.write("\n");
			initialized = false;
		},
	};
}

export default animatedIntro;
