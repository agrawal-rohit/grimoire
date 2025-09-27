import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { downloadTemplate } from "giget";
import { isDirAsync } from "./fs";

/** Name of the shared templates directory that may be filtered out from listings. */
const SHARED_DIR_NAME = "shared";

/** Default GitHub owner to fetch templates from in remote mode.*/
const DEFAULT_GITHUB_OWNER = "agrawal-rohit";

/** Default GitHub repository to fetch templates from in remote mode. */
const DEFAULT_GITHUB_REPO = "grimoire";

/** Base URL for the GitHub API (v3). */
const GITHUB_API_BASE = "https://api.github.com";

/** When set to "true", use local templates from ./templates; otherwise, fetch from GitHub. */
const IS_LOCAL_MODE = process.env.GRIMOIRE_LOCAL_TEMPLATES === "true";

/** HTTP headers used when communicating with the GitHub API. */
const GITHUB_HEADERS = {
	"User-Agent": "grimoire-cli",
	Accept: "application/vnd.github.v3+json",
} as const;

export type TemplateSource = "local" | "remote";

/**
 * Resolve the absolute path to the local templates root directory.
 * @returns The absolute path if the directory exists at `./templates`; otherwise null.
 */
async function getLocalTemplatesRoot(): Promise<string | null> {
	const localTemplatesPath = path.resolve(process.cwd(), "templates");
	if (await isDirAsync(localTemplatesPath)) return localTemplatesPath;
	return null;
}

/**
 * Resolves the absolute path to the local templates subdirectory for a given language and optional item.
 * @param language The programming language for the templates.
 * @param item Optional item within the language.
 * @returns The path to the language subdirectory or item directory if it exists; otherwise null.
 */
async function getLocalTemplatesSubdir(
	language: string,
	item?: string,
): Promise<string | null> {
	const root = await getLocalTemplatesRoot();
	if (!root) return null;

	const langRoot = path.join(root, language);
	if (!(await isDirAsync(langRoot))) return null;

	if (item) {
		const itemDir = path.join(langRoot, item);
		if (await isDirAsync(itemDir)) return itemDir;
		return null;
	}

	return langRoot;
}

/**
 * @param dir The directory to list child directories from.
 * @param includeShared Whether to include the shared directory in the results.
 * @returns An array of child directory names, excluding shared if not included.
 */
async function listChildDirs(
	dir: string,
	includeShared: boolean,
): Promise<string[]> {
	if (!(await isDirAsync(dir))) return [];
	const entries = await fs.promises.readdir(dir, { withFileTypes: true });
	let names = entries.filter((e) => e.isDirectory()).map((e) => e.name);

	if (!includeShared)
		names = names.filter((n) => n.toLowerCase() !== SHARED_DIR_NAME);

	return names;
}

/**
 * Build a GitHub API Contents URL for a templates subtree.
 * @param language The programming language for the templates.
 * @param item Optional item within the language.
 * @returns The constructed API URL.
 */
function buildContentsURL(language: string, item?: string): string {
	const subpath = ["templates", language, item].filter(Boolean).join("/");
	return `${GITHUB_API_BASE}/repos/${DEFAULT_GITHUB_OWNER}/${DEFAULT_GITHUB_REPO}/contents/${subpath}`;
}

/**
 * Build a giget specification for a subtree within the default repo.
 * @param language The programming language for the templates.
 * @param item Optional item within the language.
 * @returns The constructed giget spec string.
 */
function buildGigetSpec(language: string, item?: string): string {
	const subpath = ["templates", language, item].filter(Boolean).join("/");
	return `github:${DEFAULT_GITHUB_OWNER}/${DEFAULT_GITHUB_REPO}/${subpath}`;
}

/**
 * Check whether a remote templates subtree exists in GitHub.
 * @param language The programming language for the templates.
 * @param item Optional item within the language.
 * @returns True if the subtree exists or is uncertain, false if definitely not.
 */
async function subtreeExistsRemote(
	language: string,
	item?: string,
): Promise<boolean> {
	try {
		const url = buildContentsURL(language, item);
		const res = await fetch(url, { headers: GITHUB_HEADERS });
		if (res.status === 404) return false; // definitely not there
		if (!res.ok) return true; // uncertain; assume exists and let giget verify
		const data = await res.json();
		if (Array.isArray(data)) return true;
		if (data && typeof data === "object" && data.type === "dir") return true;
		return false;
	} catch {
		return true;
	}
}

/**
 * Attempt to normalize the downloaded directory to the expected subtree.
 * @param downloadedDir The path to the downloaded directory.
 * @param language The programming language for the templates.
 * @param item Optional item within the language.
 * @returns The normalized directory path.
 */
async function normalizeDownloadedDir(
	downloadedDir: string,
	language: string,
	item?: string,
): Promise<string> {
	const candidates: string[] = item
		? [
				path.join(downloadedDir, "templates", language, item),
				path.join(downloadedDir, language, item),
				path.join(downloadedDir, item),
				downloadedDir,
			]
		: [
				path.join(downloadedDir, "templates", language),
				path.join(downloadedDir, language),
				downloadedDir,
			];

	for (const cand of candidates) {
		if (await isDirAsync(cand)) return cand;
	}
	return downloadedDir;
}

// Remote caches
const remotePathCache = new Map<string, string>();
const remotePathInFlight = new Map<string, Promise<string>>();
const remoteListCache = new Map<string, string[]>();

/**
 * Download a remote templates subtree to a temporary directory and return the normalized path.
 * @param language The programming language for the templates.
 * @param item Optional item within the language.
 * @returns The path to the downloaded and normalized directory.
 */
async function downloadRemoteTemplatesSubdir(
	language: string,
	item?: string,
): Promise<string> {
	const spec = buildGigetSpec(language, item);

	// Cache hit
	if (remotePathCache.has(spec)) return remotePathCache.get(spec) as string;

	// Coalesce concurrent downloads
	if (remotePathInFlight.has(spec))
		return remotePathInFlight.get(spec) as Promise<string>;

	const promise = (async () => {
		const exists = await subtreeExistsRemote(language, item);
		if (!exists) {
			throw new Error(
				`Remote templates path does not exist: templates/${language}${item ? `/${item}` : ""} (repo: ${DEFAULT_GITHUB_OWNER}/${DEFAULT_GITHUB_REPO}).`,
			);
		}

		const tmpRoot = await fs.promises.mkdtemp(
			path.join(os.tmpdir(), "grimoire-templates-"),
		);

		try {
			const res = await downloadTemplate(spec, { dir: tmpRoot, force: true });
			const normalized = await normalizeDownloadedDir(res.dir, language, item);
			remotePathCache.set(spec, normalized);
			return normalized;
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			throw new Error(
				`Failed to download templates from "${spec}". ${msg}. ` +
					`Ensure the path exists and that network/GitHub access are available.`,
			);
		} finally {
			remotePathInFlight.delete(spec);
		}
	})();

	remotePathInFlight.set(spec, promise);
	return promise;
}

/**
 * List child directories from the GitHub Contents API without downloading the subtree.
 * @param language The programming language for the templates.
 * @param item Optional item within the language.
 * @param includeShared Whether to include the shared directory in the results.
 * @returns An array of child directory names or null if unable to fetch.
 */
async function listRemoteChildDirsViaAPI(
	language: string,
	item: string | undefined,
	includeShared: boolean,
): Promise<string[] | null> {
	const cacheKey = `${DEFAULT_GITHUB_OWNER}/${DEFAULT_GITHUB_REPO}:templates/${language}${item ? `/${item}` : ""}:shared=${includeShared}`;
	if (remoteListCache.has(cacheKey))
		return remoteListCache.get(cacheKey) as string[];

	try {
		const url = buildContentsURL(language, item);
		const res = await fetch(url, { headers: GITHUB_HEADERS });
		if (!res.ok) return null;
		const data = await res.json();
		if (!Array.isArray(data)) return null;

		let names = data
			.filter(
				(entry) =>
					entry && entry.type === "dir" && typeof entry.name === "string",
			)
			.map((entry) => entry.name as string);

		if (!includeShared)
			names = names.filter((n) => n.toLowerCase() !== SHARED_DIR_NAME);

		remoteListCache.set(cacheKey, names);
		return names;
	} catch {
		return null;
	}
}

/**
 * Resolve the on-disk directory that contains templates for a given language and item.
 * @param language The programming language for the templates.
 * @param item Optional item within the language.
 * @returns An object with the path and source of the templates directory.
 */
export async function resolveTemplatesDir(
	language: string,
	item?: string,
): Promise<{ path: string; source: TemplateSource }> {
	if (IS_LOCAL_MODE) {
		const localDir = await getLocalTemplatesSubdir(language, item);
		if (localDir) return { path: localDir, source: "local" };

		const root = (await getLocalTemplatesRoot()) || "<no local templates root>";
		throw new Error(
			`Local templates not found at ${root} for language "${language}"${item ? ` and item "${item}"` : ""}.`,
		);
	}

	// Remote mode
	const remoteDir = await downloadRemoteTemplatesSubdir(language, item);
	if (await isDirAsync(remoteDir)) {
		return { path: remoteDir, source: "remote" };
	}

	throw new Error(
		`No remote templates found for language "${language}"${item ? ` and item "${item}"` : ""} in ${DEFAULT_GITHUB_OWNER}/${DEFAULT_GITHUB_REPO}.`,
	);
}

/**
 * List available template names (subdirectories) for a given language and item.
 * @param language The programming language for the templates.
 * @param item The item type, defaults to "package".
 * @param options Options for listing, including whether to include shared.
 * @returns An array of available template names.
 */
export async function listAvailableTemplates(
	language: string,
	item: string = "package",
	options: { includeShared?: boolean } = {},
): Promise<string[]> {
	const includeShared = Boolean(options.includeShared);

	if (IS_LOCAL_MODE) {
		const localDir = await getLocalTemplatesSubdir(language, item);
		if (!localDir) return [];
		return listChildDirs(localDir, includeShared);
	}

	// Prefer API listing
	const apiNames = await listRemoteChildDirsViaAPI(
		language,
		item,
		includeShared,
	);
	if (apiNames && apiNames.length > 0) return apiNames;

	// Download subtree and list locally
	try {
		const dir = await downloadRemoteTemplatesSubdir(language, item);
		const names = await listChildDirs(dir, includeShared);
		return names;
	} catch {
		return [];
	}
}
