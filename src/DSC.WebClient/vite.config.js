import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ fastRefresh: false })],
  // Serve static assets from `public` while using the project root for index.html
  publicDir: 'public',
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
  }
})
