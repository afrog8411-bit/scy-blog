import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://scy-blog.pages.dev',
  redirects: {
    '/blog/早起攻略/': '/blog/energetic-sleep/',
    '/blog/如何订阅codexchatgpt/': '/blog/how-to-subscribe-codex-chatgpt/',
    '/blog/obsidian-电脑手机自动同步教程小白ai懒人版/': '/blog/obsidian-syncthing-sync-guide/',
  },
  integrations: [mdx(), sitemap(), tailwind()],
  vite: {
    optimizeDeps: {
      exclude: ['sharp'],
    },
    ssr: {
      external: ['sharp'],
    },
  },
});
