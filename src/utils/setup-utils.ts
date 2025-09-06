import validatePackageName from "validate-npm-package-name";

// Check if the chosen name is a valid name for npm
export function validateLibraryName(name: string): true | string {
  const res = validatePackageName(name);
  if (res.validForNewPackages) return true;

  const errors = [...(res.errors || []), ...(res.warnings || [])].join(", ");
  return `Invalid library name: ${errors}`;
}
