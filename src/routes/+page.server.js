import QRCode from 'qrcode';

const all_links = [
	{
		title: 'photos',
		url: 'https://500px.com/p/morganw?view=licensing',
		blurb: '500px photo portfolio',
	},
	{
		title: 'instagram',
		url: 'https://instagram.com/zenfo.co',
		blurb: 'Instagram profile',
	},
	{
		title: 'LinkedIn',
		url: 'https://linkedin.com/in/mrgnw',
		blurb: 'LinkedIn profile',
	},
	{
		title: 'github',
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
		url: 'https://t.me/mrgnw',
		blurb: 'Message on Telegram',
	},
]

export async function load() {
	await Promise.all(all_links.map(async (link) => {
		link.qr = await QRCode.toString(
			link.url, {
			type: 'svg',
			width: 164,
		}
		);
	}));

	return {
		all_links
	};
}