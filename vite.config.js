import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Split vendor libraries into separate cacheable chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'react-dom'
            if (id.includes('react-router-dom') || id.includes('react-router')) return 'router'
            if (id.includes('react')) return 'react'
            return 'vendor'
          }
        },
      },
    },
    // Increase warning threshold to avoid noisy warnings
    chunkSizeWarningLimit: 600,
    // Minification
    minify: 'esbuild',
    // Enable source map in production for debugging (optional, remove if not needed)
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
  },
  // Pre-bundle common deps for faster dev server startup
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
