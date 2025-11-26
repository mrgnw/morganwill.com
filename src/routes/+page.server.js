import QRCode from 'qrcode';
import { env } from '$env/dynamic/private';

/**
 * Generate an SVG with individual rects for animation
 * @param {string} text - Text to encode
 * @param {number} size - SVG size in pixels
 * @returns {string} SVG string with individual rect elements
 */
function generateAnimatedQRSvg(text, size = 164) {
	const qr = QRCode.create(text);
	const modules = qr.modules;
	const moduleCount = modules.size;
	const moduleSize = size / moduleCount;
	
	let rects = '';
	let index = 0;
	
	for (let row = 0; row < moduleCount; row++) {
		for (let col = 0; col < moduleCount; col++) {
			const idx = row * moduleCount + col;
			if (modules.data[idx]) {
				const x = col * moduleSize;
				const y = row * moduleSize;
				// Add data-index for CSS animation stagger
				rects += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" data-i="${index}"/>`;
				index++;
			}
		}
	}
	
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${rects}</svg>`;
}

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
		title: 'resume',
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

/**
 * Get filtered links based on hostname and URL params
 * @param {typeof combinedLinks} allLinks
 * @param {string} hostname
 * @param {URLSearchParams} urlParams
 * @returns {{ links: typeof allLinks, qrMode: boolean, qrsMode: boolean }}
 */
function getFilteredLinks(allLinks, hostname, urlParams) {
	const linksParam = urlParams.get("links");
	
	// Check for ?links=li.tg.ig OR just ?li&tg&ig OR ?wa.li (keys as link identifiers)
	const paramKeys = [...urlParams.keys()];
	
	// Split any keys that contain . or , (e.g., ?wa.li becomes ["wa", "li"])
	const expandedKeys = paramKeys.flatMap(key => key.split(/[.,]/));
	
	// Check if qr mode is requested (via ?qr or ?li.tg.qr)
	const qrMode = urlParams.has("qr") || expandedKeys.includes("qr");
	// Check if all-qr mode is requested (via ?qrs or ?li.tg.qrs)
	const qrsMode = urlParams.has("qrs") || expandedKeys.includes("qrs");
	
	// Filter out "qr" and "qrs" from matching keys
	const matchingKeys = expandedKeys.filter(key => 
		key !== "qr" && key !== "qrs" && allLinks.some(link => link.title === key || link.alias === key)
	);
	
	let links;
	if (linksParam) {
		// Explicit ?links=li.tg.ig or ?links=li,tg,ig format
		const requestedLinks = linksParam.split(/[.,]/).map(s => s.trim().toLowerCase()).filter(s => s !== "qr" && s !== "qrs");
		links = requestedLinks
			.map(key => allLinks.find(link => link.title === key || link.alias === key))
			.filter(Boolean);
	} else if (matchingKeys.length > 0) {
		// Shorthand ?li&tg&ig or ?wa.li format
		links = matchingKeys
			.map(key => allLinks.find(link => link.title === key || link.alias === key))
			.filter(Boolean);
	} else if (hostname === "morganwill.com") {
		links = ["linkedin", "github", "bluesky", "telegram", "cv"]
			.map(title => allLinks.find(link => link.title === title))
			.filter(Boolean);
	} else if (hostname === "zenfo.co") {
		links = ["instagram", "blog", "bluesky", "telegram"]
			.map(title => allLinks.find(link => link.title === title))
			.filter(Boolean);
	} else {
		links = allLinks.filter(link => link.title !== "cv");
	}
	
	return { links, qrMode, qrsMode };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, url }) {
	// Get hostname from request headers (works with Cloudflare, proxies, etc.)
	const hostname = request.headers.get('host')?.split(':')[0] 
		?? url.hostname 
		?? 'localhost';
	
	const combinedLinks = [...all_links, ...getPrivateLinks()];
	
	// Check if qrs mode early to decide which QR format to use
	const paramKeys = [...url.searchParams.keys()];
	const expandedKeys = paramKeys.flatMap(key => key.split(/[.,]/));
	const willBeQrsMode = url.searchParams.has("qrs") || expandedKeys.includes("qrs");

	const linksWithQr = await Promise.all(
		combinedLinks.map(async (link) => {
			const qrUrl = link.shortUrl ?? link.url;
			// Use animated SVG (individual rects) for qrs mode
			const qr = willBeQrsMode 
				? generateAnimatedQRSvg(qrUrl, 164)
				: await QRCode.toString(qrUrl, {
						type: "svg",
						width: 164,
						margin: 0,
					});
			return { ...link, qr };
		})
	);

	const { links, qrMode, qrsMode } = getFilteredLinks(linksWithQr, hostname, url.searchParams);

	return {
		links,
		qrMode,
		qrsMode,
		hostname,
		all_links: linksWithQr
	};
}