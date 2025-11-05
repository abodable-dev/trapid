import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev'),
  },
})
