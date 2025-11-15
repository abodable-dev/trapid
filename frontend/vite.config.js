import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'gantt-vendor': ['dhtmlx-gantt'],
          'pdf-vendor': ['react-pdf', 'pdfjs-dist'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'flow-vendor': ['reactflow'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'form-vendor': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Warn for chunks > 600KB
  },
})
