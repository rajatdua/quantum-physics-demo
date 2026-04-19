import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://example.com',
  i18n: {
    defaultLocale: 'da',
    locales: ['da'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  build: {
    format: 'directory'
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
});
