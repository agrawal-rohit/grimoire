import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: [...configDefaults.exclude],
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      exclude: [...(configDefaults.coverage.exclude || []), "**/commitlint.config.js", "**/lint-staged.config.js", "**/tsdown.config.ts"],
    },
  },
})
