import { mdsvex } from "mdsvex";
import mdsvexConfig from "./mdsvex.config.js";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ...mdsvexConfig.extensions],

  kit: {
    alias: {
      $components: "./src/components",
      "@/*": "./src/lib/*",
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
    vitePreprocess({}),
    mdsvex(mdsvexConfig),
  ],
};

export default config;
