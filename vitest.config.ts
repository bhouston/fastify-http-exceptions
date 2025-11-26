import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';
export default defineConfig({

  plugins: [
    tsConfigPaths({
        projects: [
        './packages/fastify-http-exceptions/tsconfig.json',
        './demos/basic-example/tsconfig.json',
        ],
    }),
  ],
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
      ],
    },
  },
});