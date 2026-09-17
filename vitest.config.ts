import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    isolate: false,
    exclude: ['**/node_modules/**', '**/coverage/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/fastify-http-exceptions/src/**/*.ts'],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
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
