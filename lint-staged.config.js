/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
module.exports = {
  // Only run Biome on code/config files that Biome actually processes (see biome.json).
  "**/*.{js,ts,jsx,tsx,cjs,mjs,json}": "pnpm check",
  // Allows YAML under .github only (CI workflows)
  ".github/**/*.{yml,yaml}": "pnpm check",
};
