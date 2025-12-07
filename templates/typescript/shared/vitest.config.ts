import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    // Match Jest's node environment
    environment: 'node',
    // Enable Jest-style global APIs (describe, test, expect) without imports
    globals: true,
    // Preserve Vitest's default excludes (already includes node_modules, etc.)
    exclude: [...configDefaults.exclude],
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      exclude: [...(configDefaults.coverage.exclude || []), "**/commitlint.config.js", "**/lint-staged.config.js"],
    },
  },
})
