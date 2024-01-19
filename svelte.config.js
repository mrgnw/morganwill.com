import preprocess from "svelte-preprocess";
import adapter from "@sveltejs/adapter-static";
import { SERVICE_WORKER_PATH } from '@sveltepress/theme-default' 

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
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
		files: { 
      serviceWorker: SERVICE_WORKER_PATH, 
    },
	},

	preprocess: [
		preprocess({
			postcss: true,
		}),
	],
};

export default config;
