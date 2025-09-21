/**
 * Copies a hardcoded set of files and directories from the repository root
 * into dist/templates/common so that templates mirror the current repo config.
*/

import fs from "node:fs";
import path from "node:path";

type Item = { kind: "file" | "dir"; src: string; dest?: string; target?: string };

const ROOT = process.cwd();
const TEMPLATE_COMMON_DIR = path.join(ROOT, "dist", "templates", "common");

// Hardcoded list of files/dirs to copy into dist/templates/common
const ITEMS: Item[] = [
	// Files
	{ kind: "file", src: ".gitignore" },
	{ kind: "file", src: ".github/dependabot.yml", target: ".github/dependabot.yml" },
	{ kind: "file", src: ".nvmrc" },
	{ kind: "file", src: "biome.json", target: 'biome.template.json' },
	{ kind: "file", src: "commitlint.config.js" },
	{ kind: "file", src: "jest.config.js" },
	{ kind: "file", src: "lint-staged.config.js" },
	{ kind: "file", src: "LICENSE" },
	{ kind: "file", src: "release.config.cjs" },


	// Directories
	{ kind: "dir", src: ".husky" },
	{ kind: "dir", src: ".github/ISSUE_TEMPLATE", target: ".github/ISSUE_TEMPLATE" },
];

function ensureDir(dir: string): void {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function copyFile(src: string, dest: string): void {
	if (!fs.existsSync(src) || !fs.statSync(src).isFile()) {
		console.warn(`- skip (missing file): ${src}`);
		return;
	}
	ensureDir(path.dirname(dest));
	fs.copyFileSync(src, dest);
}

function copyDir(srcDir: string, destDir: string): void {
	if (!fs.existsSync(srcDir) || !fs.statSync(srcDir).isDirectory()) {
		console.warn(`- skip (missing dir): ${srcDir}`);
		return;
	}

	// Clean destination to avoid stale files
	if (fs.existsSync(destDir)) {
		fs.rmSync(destDir, { recursive: true, force: true });
	}

	ensureDir(destDir);

	for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
		// Basic ignores
		if (entry.name === "node_modules" || entry.name === ".git") continue;

		const s = path.join(srcDir, entry.name);
		const d = path.join(destDir, entry.name);

		if (entry.isDirectory()) {
			copyDir(s, d);
		} else if (entry.isFile()) {
			copyFile(s, d);
		}
	}
}

/** Determine if a target path should be treated as a directory for file copies. */
function isDirLikeTarget(relTarget: string, absDest: string): boolean {
	return relTarget.endsWith("/") || (fs.existsSync(absDest) && fs.statSync(absDest).isDirectory());
}

function main(): void {
	// Ensure dist/templates/common exists
	ensureDir(path.join(ROOT, "dist"));
	ensureDir(TEMPLATE_COMMON_DIR);

	for (const item of ITEMS) {
		const srcPath = path.join(ROOT, item.src);

		// Prefer custom target if provided, else fallback to dest, else mirror src
		const relTarget = item.target ?? item.dest ?? item.src;
		let absTarget = path.join(TEMPLATE_COMMON_DIR, relTarget);

		if (item.kind === "file") {
			// If the target looks like a directory, append the source file's basename
			if (isDirLikeTarget(relTarget, absTarget)) {
				absTarget = path.join(absTarget, path.basename(item.src));
			}
			copyFile(srcPath, absTarget);
		} else {
			copyDir(srcPath, absTarget);
		}
	}
}

try {
	main();
} catch (err) {
	console.error(
		"prepare-templates failed:",
		err instanceof Error ? err.message : String(err),
	);
	process.exit(1);
}
