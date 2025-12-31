import { env } from "$env/dynamic/private";
import { linkTemplates, buildLink, parseCustomLinks } from "$lib/links.js";
import { generateQR } from "$lib/server/generateQR.js";

/** @typedef {import('$lib/links.js').Link} Link */
/** @typedef {import('$lib/links.js').LinkTemplate} LinkTemplate */

/**
 * Default links to show for each hostname
 */
/** @type {Record<string, string[]>} */
const hostDefaults = {
	"morganwill.com": ["linkedin", "github", "bluesky", "telegram", "cv"],
	"zenfo.co": ["instagram", "bluesky", "telegram"],
};

/**
 * Helper to split a string by dots or commas and extract titles/qrMode
 * @param {string} str
 * @returns {{ titles: string[], hasQr: boolean }}
 */
function extractTitlesAndQr(str) {
	const parts = str
		.split(/[.,]/)
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	const titles = [];
	let hasQr = false;

	for (const part of parts) {
		if (part === "qr") {
			hasQr = true;
		} else {
			titles.push(part);
		}
	}

	return { titles, hasQr };
}

/**
 * Parse URL params to extract requested links and param overrides
 * Handles ?ig.tg.qr or ?wa=+1234567890 formats
 * @param {URLSearchParams} urlParams
 * @returns {{ requestedTitles: string[] | null, overrides: Map<string, string>, qrMode: boolean }}
 */
function parseUrlParams(urlParams) {
	const overrides = new Map();
	let qrMode = false;
	const requestedTitles = [];

	for (const key of urlParams.keys()) {
		if (key === "qr") continue;

		const { titles, hasQr } = extractTitlesAndQr(key);
		const value = urlParams.get(key) || "";

		requestedTitles.push(...titles);
		qrMode ||= hasQr;

		// Store overrides for titles that have values
		for (const title of titles) {
			if (value) {
				overrides.set(title, value);
			}
		}
	}

	// Remove duplicates
	const unique = [...new Set(requestedTitles)];

	return {
		requestedTitles: unique.length > 0 ? unique : null,
		overrides,
		qrMode,
	};
}

/**
 * Get titles to display based on hostname and URL params
 * @param {string} hostname
 * @param {string[] | null} requestedTitles
 * @returns {string[]}
 */
function getTitlesToDisplay(hostname, requestedTitles) {
	if (requestedTitles) {
		return requestedTitles;
	}
	return (
		hostDefaults[hostname] || ["instagram", "linkedin", "bluesky", "telegram"]
	);
}

/**
 * Attach pre-generated QR codes to links, or generate on-demand with Cloudflare caching
 * @param {Link[]} allLinks
 * @param {string[]} titlesToShow
 * @param {boolean} qrMode - Whether QR codes are needed
 * @returns {Promise<Link[]>}
 */
async function buildLinksWithQr(allLinks, titlesToShow, qrMode) {
	// Filter to only requested titles
	const filteredLinks = titlesToShow
		.map((title) =>
			allLinks.find((link) => link.title === title || link.alias === title),
		)
		.filter(Boolean);

	// If QR mode is not active, skip QR generation entirely
	if (!qrMode) {
		return /** @type {Link[]} */ (filteredLinks);
	}

	// Load pre-generated QR codes
	/** @type {Record<string, string>} */
	let preGeneratedQRCodes = {};
	try {
		const qrModule = await import("$lib/generated-qr-codes.js");
		preGeneratedQRCodes = qrModule.preGeneratedQRCodes || {};
	} catch (err) {
		console.warn("Failed to load pre-generated QR codes", err);
	}

	// Attach pre-generated QR codes, or generate missing ones
	const linksWithQr = await Promise.all(
		/** @type {Link[]} */ (filteredLinks).map(async (link) => {
			let qr = preGeneratedQRCodes[link.title];

			// If QR code doesn't exist, generate it with Cloudflare caching
			if (!qr && link.url) {
				qr = await generateQR(link.url, link.title);
			}

			return { ...link, qr };
		}),
	);

	return linksWithQr;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, url }) {
	// Get hostname from request headers (works with Cloudflare, proxies, etc.)
	const hostname =
		request.headers.get("host")?.split(":")[0] ?? url.hostname ?? "localhost";

	// Parse URL params once
	const {
		requestedTitles,
		overrides: paramOverrides,
		qrMode,
	} = parseUrlParams(url.searchParams);

	// Count existing links by type (for CUSTOM_LINKS auto-naming)
	/** @type {Map<string, number>} */
	const existingCounts = new Map();

	for (const template of linkTemplates) {
		if (template.envVar && env[template.envVar]) {
			existingCounts.set(
				template.title,
				(existingCounts.get(template.title) || 0) + 1,
			);
		}
	}

	// Parse custom links from CUSTOM_LINKS env var
	const customLinkTemplates = parseCustomLinks(
		env.CUSTOM_LINKS,
		existingCounts,
	);

	// Combine base templates with custom templates
	/** @type {LinkTemplate[]} */
	const allTemplates = [...linkTemplates, ...customLinkTemplates];

	// Build all links from templates with env/param values
	const allLinks = /** @type {Link[]} */ (
		allTemplates
			.map((template) => {
				// Get value from params, then env, then defaults
				const paramValue =
					paramOverrides.get(template.title) ||
					paramOverrides.get(template.alias) ||
					null;

				// For custom links with __customValue, use that directly
				let envValue = null;
				if (template.__customValue !== undefined) {
					envValue = template.__customValue;
				} else if (template.envVar) {
					envValue = env[template.envVar] ?? null;
				}

				return buildLink(template, paramValue, envValue);
			})
			.filter(Boolean) // Filter out null links (missing values)
	);

	// Determine which titles to display
	const titlesToShow = getTitlesToDisplay(hostname, requestedTitles);

	// Build links with QR codes (lazy load - only when qrMode is active)
	const links = await buildLinksWithQr(allLinks, titlesToShow, qrMode);

	return {
		links,
		qrMode,
		hostname,
	};
}
