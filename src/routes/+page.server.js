import QRCode from 'qrcode';

const all_links = [
	{
		title: 'photos',
		alias: 'photo',
		url: 'https://500px.com/p/morganw?view=licensing',
		blurb: '500px photo portfolio',
	},
	{
		title: 'instagram',
		alias: 'ig',
		url: 'https://instagram.com/zenfo.co',
		blurb: 'Instagram profile',
	},
	{
		title: 'LinkedIn',
		alias: 'li',
		url: 'https://linkedin.com/in/mrgnw',
		blurb: 'LinkedIn profile',
	},
	{
		title: 'github',
		alias: 'gh',
		url: 'https://github.com/mrgnw',
		blurb: 'GitHub profile',
	},
	{
		title: 'bluesky',
		url: 'https://bsky.app/profile/xcc.es',
		blurb: 'Bluesky profile',
	},
	{
		title: 'message',
		alias: 'dm',
		url: 'https://t.me/mrgnw',
		blurb: 'Message on Telegram',
	},
	{
		title: 'cv',
		alias: 'cv',
		url: 'https://cv.morganwill.com/',
		blurb: 'View my résumé/cv in HTML or download a PDF',
	},
]

export async function load() {
	const links = await Promise.all(
		all_links.map(async (link) => {
			const qr = await QRCode.toString(link.url, {
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