import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external access
    strictPort: false, // Allow fallback to other ports
    cors: true, // Enable CORS for mobile access
    hmr: {
      host: 'localhost'
    }
  },
  define: {
    'import.meta.env.VITE_NETLIFY_URL': JSON.stringify(
      process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : ''
    )
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion'],
          icons: ['lucide-react'],
          utils: ['date-fns']
        }
      }
    },
    // Enable advanced optimizations
    minify: 'esbuild',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'date-fns'],
    exclude: ['@vite/client', '@vite/env', 'exceljs']
  }
})
