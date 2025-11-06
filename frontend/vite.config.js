import { defineConfig } from 'vite'

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:4000'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: API_BASE,
        changeOrigin: true,
      }
    }
  }
})

