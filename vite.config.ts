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
        '.keep': 'text', // treat .keep files as plain text
      },
    },
  },
});
