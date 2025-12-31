import QRCode from "qrcode";

/**
 * Generate QR code SVG for a given URL
 * Uses Cloudflare Cache API to cache results globally
 * @param {string} url - URL to encode
 * @param {string} title - Link title for cache key
 * @returns {Promise<string>} SVG string
 */
export async function generateQR(url, title) {
	// Create cache key
	const cacheKey = new URL(`https://qr-cache.internal/${title}?url=${encodeURIComponent(url)}`);

	// Try to get from Cloudflare cache first
	const cache = caches.default;
	let response = await cache.match(cacheKey);

	if (response) {
		const svg = await response.text();
		console.log(`[QR Cache] Hit for ${title}`);
		return svg;
	}

	// Cache miss - generate QR code
	console.log(`[QR Generate] Creating QR code for ${title}`);

	try {
		const qr = QRCode.create(url);
		const modules = qr.modules;
		const moduleCount = modules.size;
		const size = 164;
		const moduleSize = size / moduleCount;

		// Build rects for filled modules
		const rects = [];
		for (let row = 0; row < moduleCount; row++) {
			for (let col = 0; col < moduleCount; col++) {
				const idx = row * moduleCount + col;
				if (modules.data[idx]) {
					const x = col * moduleSize;
					const y = row * moduleSize;
					rects.push(
						`<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="currentColor"/>`,
					);
				}
			}
		}

		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow:visible">${rects.join("")}</svg>`;

		// Cache the result in Cloudflare Cache API
		// Cache for 1 year - will be purged on new deployments if needed
		const cacheResponse = new Response(svg, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		});

		await cache.put(cacheKey, cacheResponse.clone());
		console.log(`[QR Cache] Stored for ${title}`);

		return svg;
	} catch (err) {
		console.error(`[QR Generate] Failed for ${title}:`, err);
		return "";
	}
}
