import fs from "node:fs";
import path from "node:path";

/**
 * Ensure a directory exists (mkdir -p).
 * @param dirPath - Directory to create if missing.
 */
export async function ensureDirAsync(dirPath: string): Promise<void> {
	await fs.promises.mkdir(dirPath, { recursive: true });
}

/**
 * Write data to a file, ensuring parent directories exist.
 * @param filePath - Absolute or relative path to the file.
 * @param data - File contents.
 */
export async function writeFileAsync(
	filePath: string,
	data: string,
): Promise<void> {
	const dir = path.dirname(filePath);
	await ensureDirAsync(dir);
	await fs.promises.writeFile(filePath, data, "utf8");
}

/**
 * Copy a file if it exists, ensuring destination directory exists.
 * No-ops when source is missing or is not a regular file.
 * @param src - Source file path.
 * @param dest - Destination file path.
 */
export async function copyFileSafeAsync(
	src: string,
	dest: string,
): Promise<void> {
	try {
		const stat = await fs.promises.stat(src);
		if (!stat.isFile()) return;
	} catch {
		return;
	}
	await ensureDirAsync(path.dirname(dest));
	await fs.promises.copyFile(src, dest);
}

/**
 * Recursively copy a directory tree. If the source directory does not exist, it no-ops.
 * @param srcDir - Source directory path.
 * @param destDir - Destination directory path.
 */
export async function copyDirSafeAsync(
	srcDir: string,
	destDir: string,
): Promise<void> {
	try {
		const st = await fs.promises.stat(srcDir);
		if (!st.isDirectory()) return;
	} catch {
		return;
	}

	await ensureDirAsync(destDir);
	const entries = await fs.promises.readdir(srcDir, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(srcDir, entry.name);
		const destPath = path.join(destDir, entry.name);

		if (entry.isDirectory()) {
			await copyDirSafeAsync(srcPath, destPath);
		} else if (entry.isFile()) {
			await copyFileSafeAsync(srcPath, destPath);
		}
	}
}
