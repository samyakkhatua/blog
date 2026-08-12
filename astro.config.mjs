import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://blog.samyakkhatua.in',
  build: {
    format: 'directory',
  },
});
