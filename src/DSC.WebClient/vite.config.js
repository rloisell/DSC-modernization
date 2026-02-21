import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ fastRefresh: false })],
  // Serve static assets from `public` while using the project root for index.html
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@bcgov')) {
              return 'bcgov'
            }
            if (id.includes('react-router')) {
              return 'router'
            }
            if (id.includes('react')) {
              return 'react'
            }
            return 'vendor'
          }
        }
      }
    }
  },
  server: {
    hmr: false,
    port: 5173,
    proxy: {
      // Proxy API calls to the backend during local development
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
