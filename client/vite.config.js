import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API and uploaded images are proxied to the Express server,
// so the browser only talks to one origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
