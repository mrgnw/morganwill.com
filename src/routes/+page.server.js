import QRCode from "qrcode";
import { env } from "$env/dynamic/private";
import { linkTemplates, buildLink } from "$lib/links.js";

/** @typedef {import('$lib/links.js').Link} Link */

/**
 * Seeded random number generator for consistent shuffling
 * @param {number} seed
 * @returns {function(): number}
 */
function seededRandom(seed) {
  return function () {
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
  const seed = text
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  const shuffledRects = shuffleArray(allRects, random);

  // Build SVG string with shuffled order
  let rects = "";
  shuffledRects.forEach((rect, index) => {
    rects += `<rect x="${rect.x}" y="${rect.y}" width="${moduleSize}" height="${moduleSize}" data-i="${index}" fill="currentColor"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow:visible">${rects}</svg>`;
}

/**
 * Default links to show for each hostname
 */
const hostDefaults = {
  "morganwill.com": ["linkedin", "github", "bluesky", "telegram", "cv"],
  "zenfo.co": ["instagram", "bluesky", "telegram"],
};

/**
 * Parse URL params to extract requested links and param overrides
 * Returns both the links to display and any value overrides
 * Handles ?wa=+1234567890&li or ?wa.li=value or ?links=li,tg formats
 * @param {URLSearchParams} urlParams
 * @returns {{ requestedTitles: string[] | null, overrides: Map<string, string>, qrMode: boolean }}
 */
function parseUrlParams(urlParams) {
  const overrides = new Map();
  const qrMode = urlParams.has("qr");

  // Check for explicit ?links=li,tg,ig format
  const linksParam = urlParams.get("links");
  if (linksParam) {
    const requestedTitles = linksParam
      .split(/[.,]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s && s !== "qr");
    return { requestedTitles, overrides, qrMode };
  }

  // Parse other params for values and titles
  const paramKeys = [...urlParams.keys()];
  const requestedTitles = [];

  for (const key of paramKeys) {
    if (key === "qr") continue;

    // Handle dot-separated keys like ?wa.li=value
    const keys = key.split(".");
    const value = urlParams.get(key) || "";

    for (const k of keys) {
      if (k && k !== "qr") {
        requestedTitles.push(k);
        // Only store override if it has a value
        if (value) {
          overrides.set(k, value);
        }
      }
    }
  }

  // Return null for requestedTitles if no params (use defaults)
  return {
    requestedTitles: requestedTitles.length > 0 ? requestedTitles : null,
    overrides,
    qrMode,
  };
}

/**
 * Get links to display based on hostname and URL params
 * @param {Link[]} allLinks
 * @param {string} hostname
 * @param {URLSearchParams} urlParams
 * @returns {{ links: Link[], qrMode: boolean }}
 */
function getFilteredLinks(allLinks, hostname, urlParams) {
  const { requestedTitles, qrMode } = parseUrlParams(urlParams);

  // Determine which titles to show
  let titlesToShow;
  if (requestedTitles) {
    // URL params determine what's shown
    titlesToShow = requestedTitles;
  } else {
    // Use hostname defaults
    titlesToShow = hostDefaults[hostname] || [
      "instagram",
      "linkedin",
      "bluesky",
      "telegram",
    ];
  }

  // Filter allLinks to only show requested ones
  const links = titlesToShow
    .map((title) =>
      allLinks.find((link) => link.title === title || link.alias === title),
    )
    .filter(Boolean);

  return { links, qrMode };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, url }) {
  // Get hostname from request headers (works with Cloudflare, proxies, etc.)
  const hostname =
    request.headers.get("host")?.split(":")[0] ?? url.hostname ?? "localhost";

  // Parse URL params once for both filtering and overrides
  const {
    requestedTitles,
    overrides: paramOverrides,
    qrMode,
  } = parseUrlParams(url.searchParams);

  // Build all links from templates with env/param values
  const allLinks = linkTemplates
    .map((template) => {
      // Get value from params, then env, then defaults
      const paramValue =
        paramOverrides.get(template.title) ||
        paramOverrides.get(template.alias) ||
        null;
      const envValue = template.envVar ? (env[template.envVar] ?? null) : null;

      return buildLink(template, paramValue, envValue);
    })
    .filter(Boolean); // Filter out null links (missing values)

  // Generate QR codes for all links
  const linksWithQr = await Promise.all(
    allLinks.map(async (link) => {
      const qr = generateAnimatedQRSvg(link.url, 164);
      return { ...link, qr };
    }),
  );

  // Determine which links to show based on hostname and params
  let links;
  if (requestedTitles) {
    // URL params determine what's shown
    links = requestedTitles
      .map((title) =>
        linksWithQr.find(
          (link) => link.title === title || link.alias === title,
        ),
      )
      .filter(Boolean);
  } else {
    // Use hostname defaults
    const titlesToShow = hostDefaults[hostname] || [
      "instagram",
      "linkedin",
      "bluesky",
      "telegram",
    ];
    links = titlesToShow
      .map((title) =>
        linksWithQr.find(
          (link) => link.title === title || link.alias === title,
        ),
      )
      .filter(Boolean);
  }

  return {
    links,
    qrMode,
    hostname,
    all_links: linksWithQr,
  };
}
