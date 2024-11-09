import { sitemapHook } from 'sveltekit-sitemap';
import { sitemap } from './sitemap';

export const handle = sitemapHook(sitemap, {
	getOrigin: (event) => `https://${event.request.headers.get('host')}`,
	getRoutes: async (event) => {
		return {
			"/": {
				path: "/",
				priority: "1.0",
				changeFreq: "weekly"
			}
		};
	},
	getRobots: async (event) => ({
		userAgent: "*",
		crawlDelay: 1000,
		paths: {
			"/": true
		}
	})
});
