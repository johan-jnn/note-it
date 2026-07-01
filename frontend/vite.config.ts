import { svelte } from '@sveltejs/vite-plugin-svelte';
import { join } from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: join(__dirname, '../dist/frontend'),
  },
});
