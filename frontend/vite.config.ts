import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
      },
      // NestJS serves the built frontend as plain static files (no Node server), so
      // this must be a fully static/SPA build; the fallback handles client-side routes.
      adapter: adapter({
        pages: '../dist/frontend',
        assets: '../dist/frontend',
        fallback: 'index.html',
      }),
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
