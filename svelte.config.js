import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";
import { markdoc } from 'svelte-markdoc-preprocess';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.markdoc', '.svelte'],
	kit: {
		alias: {
			$components: './src/components',
		},
		adapter: adapter(
			{
				pages: 'build',
				assets: 'build',
				fallback: 'index.html',
				precompress: true,
				strict: true,
				routes: {
					include: ['/*'],
					exclude: ['<all>']
				}
			}
		),
	},

	preprocess: [
		preprocess({
			postcss: true,
		}),
		markdoc(),
	],
};

export default config;
