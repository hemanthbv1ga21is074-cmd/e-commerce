import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 25000,
    hookTimeout: 25000,
    fileParallelism: false, // Run test files sequentially to prevent database connection contention on Supabase pooler
  },
});
