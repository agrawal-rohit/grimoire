import validatePkg from "validate-npm-package-name";
import { PackageManager } from "../types/package-manager.types";
import { commandExists, run } from "./shell.utils";

/**
 * Validates a library name to ensure it conforms to NPM package name rules.
 * @param name - The library/package name to validate.
 * @returns true if the name is valid for new packages; otherwise an error string.
 */
export function validatePackageName(name: string): true | string {
  const res = validatePkg(name);
  if (res.validForNewPackages) return true;

  const errors = [...(res.errors || []), ...(res.warnings || [])].join(", ");
  return `Invalid library name: ${errors}`;
}

/**
 * Try to activate pnpm/yarn via Corepack.
 * Returns true if the tool is available afterwards.
 * @param tool - The package manager to activate ("pnpm" | "yarn").
 */
function activateViaCorepack(tool: "pnpm" | "yarn"): boolean {
  if (!commandExists("corepack")) return false;
  try {
    // Idempotent enable
    run("corepack enable", { stdio: "inherit" });

    if (tool === "pnpm") {
      run("corepack prepare pnpm@latest --activate", { stdio: "inherit" });
    } else {
      run("corepack prepare yarn@stable --activate", { stdio: "inherit" });
    }

    return commandExists(tool);
  } catch {
    return false;
  }
}

/**
 * Install a package globally using npm.
 * @param pkg - The package name to install globally (e.g., "pnpm").
 * @returns true if the tool is available afterwards.
 */
function installGloballyWithNpm(pkg: string): boolean {
  try {
    run(`npm i -g ${pkg}`, { stdio: "inherit" });
    return commandExists(pkg);
  } catch {
    return false;
  }
}

/**
 * Ensure the selected package manager is available on the system
 * and return a packageManager identifier string (e.g., "pnpm@9.0.0")
 * that can be added to package.json's "packageManager" field.
 * @param pm - The package manager to verify/resolve.
 */
export function ensurePackageManager(pm: PackageManager): string {
  switch (pm) {
    case PackageManager.NPM: {
      if (!commandExists("npm")) {
        throw new Error(
          "npm is not available on PATH. Please install Node.js (which includes npm) and try again."
        );
      }

      const version = run("npm --version");
      return `npm@${version}`;
    }

    case PackageManager.PNPM: {
      if (commandExists("pnpm")) {
        const version = run("pnpm --version");
        return `pnpm@${version}`;
      }

      // Try Corepack activation
      if (activateViaCorepack("pnpm")) {
        const version = run("pnpm --version");
        return `pnpm@${version}`;
      }

      // Fallback: npm -g install
      if (installGloballyWithNpm("pnpm")) {
        const version = run("pnpm --version");
        return `pnpm@${version}`;
      }

      throw new Error(
        "Failed to install pnpm automatically. Please install pnpm and re-run the command."
      );
    }

    case PackageManager.YARN: {
      if (commandExists("yarn")) {
        const version = run("yarn --version");
        return `yarn@${version}`;
      }

      // Try Corepack activation
      if (activateViaCorepack("yarn")) {
        const version = run("yarn --version");
        return `yarn@${version}`;
      }

      // Fallback: npm -g install
      if (installGloballyWithNpm("yarn")) {
        const version = run("yarn --version");
        return `yarn@${version}`;
      }

      throw new Error(
        "Failed to install yarn automatically. Please install yarn and re-run the command."
      );
    }

    case PackageManager.BUN: {
      if (!commandExists("bun")) {
        throw new Error(
          "Bun is not installed. Please install Bun from https://bun.sh and re-run."
        );
      }
      const version = run("bun --version");
      return `bun@${version}`;
    }

    default: {
      // Narrow type just in case a string sneaks through
      const val = String(pm);
      throw new Error(`Unsupported package manager: ${val}`);
    }
  }
}
