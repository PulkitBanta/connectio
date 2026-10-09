import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://connectio.pulkitbanta.com',
  integrations: [sitemap()],
  // Astro 7 defaults to 'jsx', which strips whitespace between inline elements.
  compressHTML: true,
  // Self-hosted at build time with metric-matched fallbacks, so there's no third-party
  // request chain and no layout shift when the web font swaps in.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--font-instrument-sans',
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
  ],
  server: {
    port: 3010,
  },
  vite: {
    plugins: [tailwindcss()],
    // Screenshots, the icon, the tour video and package.json live in the app repo above this folder.
    server: { fs: { allow: ['..'] } },
  },
});
