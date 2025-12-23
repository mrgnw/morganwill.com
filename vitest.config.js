import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'happy-dom',
    reporters: ['verbose'],
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,svelte}'],
      exclude: ['src/**/*.test.js', 'node_modules/'],
    },
  },
  resolve: {
    alias: {
      $lib: '/src/lib',
      $components: '/src/components',
    },
  },
});
