import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /api calls to FastAPI so we avoid CORS issues in dev
    proxy: {
      '/resumes': 'http://localhost:8000',
      '/jobs':    'http://localhost:8000',
      '/match':   'http://localhost:8000',
    },
  },
})
