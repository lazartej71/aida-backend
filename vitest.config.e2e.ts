import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    fileParallelism: false,
    hookTimeout: 60000,
    testTimeout: 30000,
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
