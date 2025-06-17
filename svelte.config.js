import { mdsvex } from "mdsvex";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import adapter from '@sveltejs/adapter-cloudflare';
import { fileURLToPath } from 'url';
import { codeToHtml } from 'shiki';
import { addCopyButton } from 'shiki-transformer-copy-button';


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
      extensions: ['.md'],
      highlight: {
        highlighter: async (code, lang) => {
          const html = await codeToHtml(code, {
            lang,
            theme: 'github-dark',
            transformers: [
              addCopyButton({
                copy: 'Copy',
                copied: 'Copied!',
                copyIcon: '<svg>...</svg>',
                checkIcon: '<svg>...</svg>'
              })
            ]
          });
          return `{@html \`${html}\`}`;
        }
      }
    }),
    vitePreprocess({})
  ],

  extensions: [".svelte", ".svx"]
};

export default config;