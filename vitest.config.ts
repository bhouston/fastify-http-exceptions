import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    watch: false,
    isolate: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules',
        '**/coverage',
        '**/scripts',
        '**/dist',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test',
        '**/tests',
        '**/*.d.ts',
        '**/vitest.config.ts',
        '**/vitest.config.js',
        '**/publish',
        '**/demos/**',
      ],
    },
  },
});
