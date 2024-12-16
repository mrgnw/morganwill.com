import { mdsvex } from "mdsvex";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import adapter from '@sveltejs/adapter-cloudflare';
import { fileURLToPath } from 'url';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    alias: {
			$components: "./src/components",
			"@/*": "./src/lib/*",
			$jibs: "./src/jibs/*",
			$content: "./src/content/*",
		},
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "index.html",
      precompress: true,
      strict: true,
      routes: {
        include: ["/*"],
        exclude: ["<all>"],
      },
    }),
  },

  preprocess: [
    preprocess({
      postcss: true,
    }), 
    mdsvex({
      extensions: ['.md']
    }),
    vitePreprocess({})
  ],

  extensions: [".svelte", ".md", ".svx"]
};

export default config;