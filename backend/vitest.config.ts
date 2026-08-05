import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      FRONTEND_URL: 'http://localhost:3000',
      LOG_LEVEL: 'silent',
      SUPABASE_URL: 'http://127.0.0.1:54321',
      SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
      SUPABASE_SECRET_KEY: 'test-secret-key',
    },
    coverage: {
      reporter: ['text', 'json-summary'],
    },
  },
})
