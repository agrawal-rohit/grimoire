import { listAvailableTemplates } from "../../core/template-registry";

/** List package template names for a language.
 * @param language The language for which to list package templates.
 */
export async function listPackageTemplates(
	language: string,
): Promise<string[]> {
	return listAvailableTemplates(language, "package");
}

/** Validate that a provided template exists for the given language/area.
 * @param language The language.
 * @param template The template name to validate.
 * @param item The area (e.g., "package").
 */
export async function assertSupportedTemplate(
	language: string,
	template: string,
	item: string,
): Promise<void> {
	const names = await listAvailableTemplates(language, item);
	if (!names.includes(template)) {
		throw new Error(`Unsupported template: ${template}`);
	}
}
