import validatePkg from "validate-npm-package-name";

/**
 * Validates a JavaScript package name to ensure it conforms to NPM package name rules.
 * @param {string} name - The package name to validate.
 * @returns {true | string} true if the name is valid for new packages; otherwise an error string describing the issues.
 */
export function validateTypescriptPackageName(name: string): true | string {
	const res = validatePkg(name);
	if (res.validForNewPackages) return true;

	const errors = [...(res.errors || []), ...(res.warnings || [])].join(", ");
	return `Invalid package name: ${errors}`;
}
