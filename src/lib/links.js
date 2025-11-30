/**
 * @typedef {Object} Link
 * @property {string} title
 * @property {string} alias
 * @property {string} url
 * @property {string} [shortUrl]
 * @property {string} blurb
 * @property {string[]} colors
 * @property {string} [qr]
 * @property {boolean} [strokeIcon] - Icon uses stroke instead of fill
 */

/** @type {Link[]} */
export const links = [
	{
		title: 'instagram',
		alias: 'ig',
		url: 'https://instagram.com/zenfo.co',
		shortUrl: 'https://a.xcc.es/photos',
		blurb: 'Instagram photo portfolio',
		colors: ['#833ab4', '#fd1d1d', '#fcb045'],
	},
	{
		title: 'linkedin',
		alias: 'li',
		url: 'https://linkedin.com/in/mrgnw',
		shortUrl: 'https://a.xcc.es/li',
		blurb: 'LinkedIn profile',
		colors: ['#0A66C2', '#004182'],
	},
	{
		title: 'github',
		alias: 'gh',
		url: 'https://github.com/mrgnw',
		shortUrl: 'https://a.xcc.es/gh',
		blurb: 'GitHub profile',
		colors: ['#6e5494', '#24292e'],
		strokeIcon: true,
	},
	{
		title: 'blog',
		alias: 'blog',
		url: 'https://blog.morganwill.com',
		shortUrl: 'https://blog.morganwill.com',
		blurb: 'Blog',
		colors: ['#ff6b6b', '#ee5a24'],
	},
	{
		title: 'bluesky',
		alias: 'bsky',
		url: 'https://bsky.app/profile/xcc.es',
		shortUrl: 'https://a.xcc.es/bsky',
		blurb: 'Bluesky profile',
		colors: ['#0085ff', '#00c2ff'],
	},
	{
		title: 'telegram',
		alias: 'tg',
		url: 'https://t.me/mrgnw',
		shortUrl: 'https://t.me/mrgnw',
		blurb: 'Message on Telegram',
		colors: ['#26A5E4', '#0088cc'],
		strokeIcon: true,
	},
	{
		title: 'resume',
		alias: 'cv',
		url: 'https://cv.morganwill.com/',
		shortUrl: 'https://cv.xcc.es/',
		blurb: 'View my résumé/cv in HTML or download a PDF',
		colors: ['#2d3748', '#1a202c'],
	},
];
