// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Served from the root of GitHub Pages (ADR 0002), so `base` stays unset.
  // With a custom domain: put a CNAME file in public/ and change this URL.
  site: 'https://jjduques.github.io',
  integrations: [react()]
});
