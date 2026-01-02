import { query } from "$app/server";
import QRCode from "qrcode";
import * as v from "valibot";

/**
 * Remote function to generate QR code from client
 * Uses Cloudflare Cache API to cache results globally (in production)
 */
export const generateQR = query(
	v.object({
		url: v.string(),
		title: v.string(),
	}),
	async ({ url, title }) => {
		// Try to get from Cloudflare cache first (only in production)
		if (typeof caches !== "undefined") {
			const cacheKey = new URL(
				`https://qr-cache.internal/${title}?url=${encodeURIComponent(url)}`,
			);
			const cache = caches.default;
			let response = await cache.match(cacheKey);

			if (response) {
				const svg = await response.text();
				console.log(`[QR Cache] Hit for ${title}`);
				return svg;
			}
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

			// Cache the result in Cloudflare Cache API (only in production)
			if (typeof caches !== "undefined") {
				const cacheKey = new URL(
					`https://qr-cache.internal/${title}?url=${encodeURIComponent(url)}`,
				);
				const cache = caches.default;
				const cacheResponse = new Response(svg, {
					headers: {
						"Content-Type": "image/svg+xml",
						"Cache-Control": "public, max-age=31536000, immutable",
					},
				});

				await cache.put(cacheKey, cacheResponse.clone());
				console.log(`[QR Cache] Stored for ${title}`);
			}

			return svg;
		} catch (err) {
			console.error(`[QR Generate] Failed for ${title}:`, err);
			return "";
		}
	},
);
