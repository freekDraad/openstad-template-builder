// vite.config.ts
// Vite configuratie voor React + TypeScript + Tailwind

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
});
