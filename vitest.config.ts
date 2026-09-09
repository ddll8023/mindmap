import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@mindmap/core': new URL('./src/components/MindMap/index.ts', import.meta.url).pathname },
  },
  test: {
    exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**'],
  },
})
