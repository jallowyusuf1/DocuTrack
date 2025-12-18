import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js',
      'date-fns',
      'i18next',
      'react-i18next',
    ],
    force: true, // Force dependency optimization on server start
    esbuildOptions: {
      // Ensure React is treated as external in some cases
      target: 'es2020',
    },
  },
  server: {
    port: 5174, // MUST be 5174 - do not change
    strictPort: true, // FAIL if port is busy - prevents fallback to 5173
    host: 'localhost',
    open: false,
    cors: true,
    hmr: {
      overlay: true,
      clientPort: 5174, // MUST match server port
      protocol: 'ws',
      host: 'localhost',
      timeout: 30000,
    },
    watch: {
      usePolling: false,
      interval: 100,
    },
    // Prevent Service Worker registration in development
    middlewareMode: false,
  },
  build: {
    // Ensure React is properly bundled
    commonjsOptions: {
      include: [/react/, /react-dom/, /node_modules/],
    },
    rollupOptions: {
      output: {
        // Ensure React is externalized correctly
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    sourcemap: false, // Disable in production to reduce size
    minify: 'esbuild', // Faster builds
  },
})
