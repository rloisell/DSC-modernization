import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Use function form so we can read .env.local before defining the proxy target.
// Set VITE_API_URL in .env.local if your API runs on a non-default port.
// See .env.local.example for the template.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || 'http://localhost:5115'

  return {
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
        target: apiTarget,
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
  }
})
