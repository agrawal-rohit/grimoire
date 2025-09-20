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
