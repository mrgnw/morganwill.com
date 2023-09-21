import preprocess from "svelte-preprocess";
// import adapter from "@sveltejs/adapter-cloudflare";
import adapter from "svelte-adapter-bun";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(
			{
				pages: 'build',
				assets: 'build',
				fallback: undefined,
				precompress: false,
				strict: true
			}
		),
  },

  preprocess: [
    preprocess({
      postcss: true,
    }),
  ],
};

export default config;
