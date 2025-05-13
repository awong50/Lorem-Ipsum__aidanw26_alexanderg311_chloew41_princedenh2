import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.keep': 'text', // Treat .keep files as plain text
      },
    },
    include: ['react', 'react-dom'],  // Only include the necessary dependencies
    exclude: ['some-large-dependency'], // Exclude any large dependencies from optimization
  },
  build: {
    // Enable dynamic imports for code-splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Split vendor code into its own chunk
          }
        },
      },
    },
    // Enable minification to reduce bundle size
    minify: 'esbuild',
  },
});
