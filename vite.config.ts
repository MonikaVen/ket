import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { ketApiPlugin } from './server/vite-plugin.mjs';

export default defineConfig({
  plugins: [react(), ketApiPlugin()],
});
