import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // The public/index.html is not in the project root, set `root` so Vite
  // serves the app from the `public` directory during dev.
  root: 'public',
  server: {
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
