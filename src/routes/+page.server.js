import QRCode from 'qrcode';
import { env } from '$env/dynamic/private';

const all_links = [
	{
		title: 'instagram',
		alias: 'ig',
		url: 'https://instagram.com/zenfo.co',
		shortUrl: 'https://a.xcc.es/photos',
		blurb: 'Instagram photo portfolio',
	},
	{
		title: 'linkedin',
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
		title: 'telegram',
		alias: 'tg',
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

/**
 * Build private links from environment variables
 * These are not checked into the repository
 */
function getPrivateLinks() {
	/** @type {typeof all_links} */
	const privateLinks = [];

	if (env.PHONE_NUMBER) {
		privateLinks.push({
			title: 'phone',
			alias: 'phone',
			url: `tel:${env.PHONE_NUMBER}`,
			shortUrl: `tel:${env.PHONE_NUMBER}`,
			blurb: 'Call me',
		});
	}

	if (env.WHATSAPP_NUMBER) {
		// WhatsApp uses number without + or spaces
		const waNumber = env.WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
		privateLinks.push({
			title: 'whatsapp',
			alias: 'wa',
			url: `https://wa.me/${waNumber}`,
			shortUrl: `https://wa.me/${waNumber}`,
			blurb: 'Message on WhatsApp',
		});
	}

	return privateLinks;
}

export async function load() {
	const combinedLinks = [...all_links, ...getPrivateLinks()];

	const links = await Promise.all(
		combinedLinks.map(async (link) => {
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