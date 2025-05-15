import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react-toastify']
  },
  resolve: {
    alias: {
      'react-toastify': resolve(__dirname, 'node_modules/react-toastify')
    }
  },
  build: {
    commonjsOptions: {
      include: [/react-toastify/, /node_modules/]
    }
  }
});
