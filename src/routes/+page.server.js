import { env } from "$env/dynamic/private";
import { linkTemplates, buildLink } from "$lib/links.js";

/** @typedef {import('$lib/links.js').Link} Link */

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
 * Returns both the links to display and any value overrides
 * Handles ?wa=+1234567890&li or ?wa.li=value or ?links=li,tg or ?ig.tg.qr formats
 * @param {URLSearchParams} urlParams
 * @returns {{ requestedTitles: string[] | null, overrides: Map<string, string>, qrMode: boolean }}
 */
function parseUrlParams(urlParams) {
  const overrides = new Map();
  let qrMode = false;
  const requestedTitles = [];

  // Handle ?links=li,tg,ig format
  const linksParam = urlParams.get("links");
  if (linksParam) {
    const { titles, hasQr } = extractTitlesAndQr(linksParam);
    requestedTitles.push(...titles);
    qrMode ||= hasQr;
  }

  // Handle dot-separated param keys like ?ig.tg.qr or regular keys like ?wa=value
  for (const key of urlParams.keys()) {
    if (key === "links" || key === "qr") continue;

    const { titles, hasQr } = extractTitlesAndQr(key);
    const value = urlParams.get(key) || "";

    for (const title of titles) {
      requestedTitles.push(title);
      if (value) {
        overrides.set(title, value);
      }
    }

    qrMode ||= hasQr;
  }

  // Return null for requestedTitles if no params (use defaults)
  return {
    requestedTitles: requestedTitles.length > 0 ? requestedTitles : null,
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
 * Attach pre-generated QR codes to links
 * @param {Link[]} allLinks
 * @param {string[]} titlesToShow
 * @returns {Promise<Link[]>}
 */
async function buildLinksWithQr(allLinks, titlesToShow) {
  // Filter to only requested titles
  const filteredLinks = titlesToShow
    .map((title) =>
      allLinks.find((link) => link.title === title || link.alias === title),
    )
    .filter(Boolean);

  // Always load QR codes (same as /qr page)
  /** @type {Record<string, string>} */
  let preGeneratedQRCodes = {};
  try {
    const qrModule = await import("$lib/generated-qr-codes.js");
    preGeneratedQRCodes = qrModule.preGeneratedQRCodes || {};
  } catch (err) {
    console.warn("Failed to load pre-generated QR codes", err);
  }

  // Attach pre-generated QR codes to links
  const linksWithQr = /** @type {Link[]} */ (filteredLinks).map((link) => {
    const qr = preGeneratedQRCodes[link.title];
    return { ...link, qr };
  });

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

  // Build all links from templates with env/param values
  const allLinks = /** @type {Link[]} */ (
    linkTemplates
      .map((template) => {
        // Get value from params, then env, then defaults
        const paramValue =
          paramOverrides.get(template.title) ||
          paramOverrides.get(template.alias) ||
          null;
        const envValue = template.envVar
          ? (env[template.envVar] ?? null)
          : null;

        return buildLink(template, paramValue, envValue);
      })
      .filter(Boolean) // Filter out null links (missing values)
  );

  // Determine which titles to display
  const titlesToShow = getTitlesToDisplay(hostname, requestedTitles);

  // Build links with QR codes (always load them, same as /qr page)
  const links = await buildLinksWithQr(allLinks, titlesToShow);

  return {
    links,
    qrMode,
    hostname,
  };
}
