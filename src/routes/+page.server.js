import QRCode from 'qrcode';

const all_links = [
	{
		title: 'photos',
		alias: 'photo',
		url: 'https://instagram.com/zenfo.co',
		shortUrl: 'https://a.xcc.es/photos',
		blurb: 'Instagram photo portfolio',
	},
	{
		title: 'LinkedIn',
		alias: 'li',
		url: 'https://linkedin.com/in/mrgnw',
		shortUrl: 'https://a.xcc.es/li',
		blurb: 'LinkedIn profile',
	},
	{
		title: 'github',
		alias: 'gh',
		url: 'https://github.com/mrgnw',
		shortUrl: 'https://a.xcc.es/gh',
		blurb: 'GitHub profile',
	},
	{
		title: 'blog',
		alias: 'blog',
		url: 'https://blog.morganwill.com',
		shortUrl: 'https://blog.morganwill.com',
		blurb: 'Blog',
	},
	{
		title: 'bluesky',
		alias: 'bsky',
		url: 'https://bsky.app/profile/xcc.es',
		shortUrl: 'https://a.xcc.es/bsky',
		blurb: 'Bluesky profile',
	},
	{
		title: 'message',
		alias: 'dm',
		url: 'https://t.me/mrgnw',
		shortUrl: 'https://t.me/mrgnw',
		blurb: 'Message on Telegram',
	},
	{
		title: 'cv',
		alias: 'cv',
		url: 'https://cv.morganwill.com/',
		shortUrl: 'https://cv.xcc.es/',
		blurb: 'View my résumé/cv in HTML or download a PDF',
	},
]

export async function load() {
	const links = await Promise.all(
		all_links.map(async (link) => {
			const url = link.shortUrl ?? link.url;
			const qr = await QRCode.toString(url, {
				type: "svg",
				width: 164,
			}
			);
			return {
				...link,
				qr
			};
		})
	);

	return {
		all_links: links
	};
}