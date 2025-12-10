import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "happy-dom",
		globals: true,
		setupFiles: "./tests/setup.ts",
		exclude: [...configDefaults.exclude],
		coverage: {
			reporter: ["text", "lcov", "html"],
			exclude: [
				...(configDefaults.coverage.exclude || []),
				"**/commitlint.config.js",
				"**/lint-staged.config.js",
				"**/tsdown.config.ts",
				"**/playground/**"
			],
		},
	},
});
