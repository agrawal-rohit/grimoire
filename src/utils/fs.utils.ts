import fs from "node:fs";
import path from "node:path";

/**
 * Ensure a directory exists (mkdir -p behavior).
 * Creates the directory and any necessary parent directories if they do not exist.
 * @param dirPath - The path to the directory to ensure exists.
 */
export function ensureDir(dirPath: string): void {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

/**
 * Serialize and write data to disk.
 * Ensures the parent directory exists before writing.
 * @param filePath - The path to the file to write.
 * @param data - The data to include this in file.
 */
export function writeFile(filePath: string, data: string): void {
	const dir = path.dirname(filePath);
	ensureDir(dir);

	fs.writeFileSync(filePath, data, "utf8");
}

/**
 * Check if a path exists and is a directory.
 * @param p - Path to check.
 * @returns true if the path exists and is a directory; false otherwise.
 */
export function isDir(p: string): boolean {
	return fs.existsSync(p) && fs.statSync(p).isDirectory();
}

/**
 * Check if a path exists and is a file.
 * @param p - Path to check.
 * @returns true if the path exists and is a file; false otherwise.
 */
export function isFile(p: string): boolean {
	return fs.existsSync(p) && fs.statSync(p).isFile();
}

/**
 * Copy a file from src to dest, creating parent directories as needed.
 * Silently no-ops if the source file does not exist.
 * @param src - Source file path.
 * @param dest - Destination file path.
 */
export function copyFileSafe(src: string, dest: string): void {
	if (!isFile(src)) return;
	ensureDir(path.dirname(dest));
	fs.copyFileSync(src, dest);
}

/**
 * Recursively copy a directory. If the source does not exist, it no-ops.
 * @param srcDir - Source directory path.
 * @param destDir - Destination directory path.
 */
export function copyDirSafe(srcDir: string, destDir: string): void {
	if (!isDir(srcDir)) return;
	ensureDir(destDir);
	for (const entry of fs.readdirSync(srcDir)) {
		const srcPath = path.join(srcDir, entry);
		const destPath = path.join(destDir, entry);
		const stat = fs.statSync(srcPath);
		if (stat.isDirectory()) {
			copyDirSafe(srcPath, destPath);
		} else {
			copyFileSafe(srcPath, destPath);
		}
	}
}
