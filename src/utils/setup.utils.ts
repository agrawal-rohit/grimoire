import fs from "node:fs";
import path from "node:path";
import type { PromptAnswers } from "../types/prompts.types";
import { ensureDir, writeFile } from "./fs.utils";

/**
 * Build a human-readable author string for package.json from the provided details
 * @param authorInputs - Author details collected from prompts.
 * @returns A formatted author string or undefined if insufficient details.
 */
export function buildAuthorField(
  authorInputs: PromptAnswers["author"]
): string | undefined {
  const parts: string[] = [];
  if (authorInputs?.name) parts.push(authorInputs.name);
  if (authorInputs?.gitEmail) parts.push(`<${authorInputs.gitEmail}>`);
  return parts.length ? parts.join(" ") : undefined;
}

/**
 *
 * @param cwd - Current working directory (e.g., process.cwd()).
 * @param answers - Aggregated answers, used for the library name (directory).
 * @returns Object with the absolute targetDir and a boolean indicating if it's empty.
 */
export function createProjectDirectory(
  cwd: string,
  projectName: string
): { targetDir: string; isEmpty: boolean } {
  const targetDir = path.resolve(cwd, projectName);
  ensureDir(targetDir);

  let isEmpty = true;
  try {
    const files = fs.readdirSync(targetDir);
    isEmpty = files.length === 0;
  } catch {
    // Treat unreadable directories as empty for scaffolding purposes
    isEmpty = true;
  }

  return { targetDir, isEmpty };
}

/**
 * Create the package.json using the provided answers and package manager version.
 * @param targetDir - Absolute path to the project directory.
 * @param answers - Aggregated prompt answers describing the new project.
 * @param packageManagerVersion - A string like "pnpm@9.0.0" to record in package.json's packageManager.
 * @returns The final package.json object that was persisted to disk.
 * @throws If an existing package.json is invalid JSON.
 */
export function writePackageJson(
  targetDir: string,
  answers: PromptAnswers,
  packageManagerVersion: string
): Record<string, unknown> {
  // Converts a user-provided name into a URL-friendly slug suitable for repository/URL construction
  const createPackageSlug = (value: string): string =>
    value
      .trim()
      .toLowerCase()
      .replace(/^@/, "")
      .replace(/.*\//, "")
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // Estimate repository and homepage from author name and project name
  const authorSlug = answers.author.name?.trim()
    ? createPackageSlug(answers.author.name)
    : undefined;
  const projectSlug = createPackageSlug(answers.project.name);
  const estimatedRepoUrl = `https://github.com/${authorSlug}/${projectSlug}`;

  const pkgJson: Record<string, unknown> = {
    name: answers.project.name,
    version: "0.1.0",
    description: answers.project.description || "",
    packageManager: packageManagerVersion,
    repository: estimatedRepoUrl,
  };

  // Scripts defaults
  pkgJson.scripts = {
    test: "jest",
    build: "tsc",
    lint: "pnpm exec biome lint --write",
    format: "pnpm exec biome format --write",
    check: "pnpm exec biome check --write",
    "test:cov": "jest --coverage --passWithNoTests",
    prepack: "pnpm run build",
    release: "semantic-release",
    prepare: "husky",
  };

  // If the user opted to release to NPM, include npm-release-ready config
  if (answers.tooling.shouldReleaseToNPM) {
    pkgJson.author = buildAuthorField(answers.author);
    pkgJson.homepage = estimatedRepoUrl;
    pkgJson.files = ["dist", "package.json", "README.md"];
    pkgJson.private = false;
    pkgJson.license = "MIT";
    pkgJson.publishConfig = { access: "public" };
    pkgJson.bugs = `${pkgJson.repository}/issues`;
  }

  writeFile(
    path.join(targetDir, "package.json"),
    JSON.stringify(pkgJson, undefined, 2)
  );
  return pkgJson;
}
