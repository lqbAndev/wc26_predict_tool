import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // Enable SPA fallback for dev server — all routes serve index.html
    historyApiFallback: true,
  },
});
