import QRCode from 'qrcode';
import { env } from '$env/dynamic/private';
import { links as all_links } from '$lib/links.js';

/** @typedef {import('$lib/links.js').Link} Link */

/**
 * Seeded random number generator for consistent shuffling
 * @param {number} seed
 * @returns {function(): number}
 */
function seededRandom(seed) {
	return function() {
		seed = (seed * 1103515245 + 12345) & 0x7fffffff;
		return seed / 0x7fffffff;
	};
}

/**
 * Shuffle array using Fisher-Yates with seeded random
 * @param {Array} array
 * @param {function(): number} random
 * @returns {Array}
 */
function shuffleArray(array, random) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Generate an SVG with individual rects for animation (randomized order)
 * @param {string} text - Text to encode
 * @param {number} size - SVG size in pixels
 * @returns {string} SVG string with individual rect elements
 */
function generateAnimatedQRSvg(text, size = 164) {
	const qr = QRCode.create(text);
	const modules = qr.modules;
	const moduleCount = modules.size;
	const moduleSize = size / moduleCount;
	
	// Collect all filled rects first
	const allRects = [];
	for (let row = 0; row < moduleCount; row++) {
		for (let col = 0; col < moduleCount; col++) {
			const idx = row * moduleCount + col;
			if (modules.data[idx]) {
				const x = col * moduleSize;
				const y = row * moduleSize;
				allRects.push({ x, y });
			}
		}
	}
	
	// Shuffle rects using seeded random (seed from text hash for consistency)
	const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const random = seededRandom(seed);
	const shuffledRects = shuffleArray(allRects, random);
	
	// Build SVG string with shuffled order
	let rects = '';
	shuffledRects.forEach((rect, index) => {
		rects += `<rect x="${rect.x}" y="${rect.y}" width="${moduleSize}" height="${moduleSize}" data-i="${index}" fill="currentColor"/>`;
	});
	
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow:visible">${rects}</svg>`;
}

/**
 * Build private links from environment variables
 * These are not checked into the repository
 * @returns {Link[]}
 */
function getPrivateLinks() {
	/** @type {Link[]} */
	const privateLinks = [];

	if (env.PHONE_NUMBER) {
		privateLinks.push({
			title: 'phone',
			alias: 'phone',
			url: `tel:${env.PHONE_NUMBER}`,
			shortUrl: `tel:${env.PHONE_NUMBER}`,
			blurb: 'Call me',
			colors: ['#34c759', '#28a745'],
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
			colors: ['#25D366', '#128C7E'],
		});
	}

	return privateLinks;
}

/**
 * Get filtered links based on hostname and URL params
 * @param {Link[]} allLinks
 * @param {string} hostname
 * @param {URLSearchParams} urlParams
 * @returns {{ links: Link[], qrMode: boolean, qrsMode: boolean }}
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