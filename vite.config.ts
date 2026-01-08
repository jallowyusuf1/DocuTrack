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
        manualChunks: (id) => {
          // React and React Router
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion-vendor';
          }
          // Large document-related chunks
          if (id.includes('pages/documents') && id.includes('ComprehensiveDocumentDetail')) {
            return 'document-detail';
          }
          if (id.includes('pages/documents') && id.includes('Documents')) {
            return 'documents-page';
          }
          if (id.includes('pages/settings') && id.includes('DesktopSettings')) {
            return 'settings-page';
          }
          // Landing page
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
