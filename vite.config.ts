import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5174,
    hmr: {
      clientPort: 5174,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Use deterministic chunk names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // React and React Router - stable chunk name
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // Supabase - stable chunk name
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }
          // Framer Motion - stable chunk name
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion-vendor';
          }
          // Large document-related chunks - stable chunk names
          if (id.includes('pages/documents') && id.includes('ComprehensiveDocumentDetail')) {
            return 'document-detail';
          }
          if (id.includes('pages/documents') && (id.includes('Documents.tsx') || id.includes('Documents.jsx'))) {
            return 'documents-page';
          }
          if (id.includes('pages/settings') && id.includes('DesktopSettings')) {
            return 'settings-page';
          }
          // Landing page - stable chunk name
          if (id.includes('pages/landing')) {
            return 'landing-page';
          }
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
