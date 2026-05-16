import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/football_prediction_tool/',
  plugins: [react()],
});
