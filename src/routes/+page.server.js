import { env } from "$env/dynamic/private";
import { linkTemplates, buildLink } from "$lib/links.js";

/** @typedef {import('$lib/links.js').Link} Link */

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
 * Attach pre-generated QR codes to links (lazy loads the QR file)
 * @param {Link[]} allLinks
 * @param {string[]} titlesToShow
 * @param {boolean} qrMode - Whether QR mode is active
 * @returns {Promise<Link[]>}
 */
async function buildLinksWithQr(allLinks, titlesToShow, qrMode) {
  // Filter to only requested titles
  const filteredLinks = titlesToShow
    .map((title) =>
      allLinks.find((link) => link.title === title || link.alias === title),
    )
    .filter(Boolean);

  // Only import QR codes if in QR mode
  // This defers the 35ms+ import cost until actually needed
  let preGeneratedQRCodes = {};

  if (qrMode) {
    try {
      const qrModule = await import("$lib/generated-qr-codes.js");
      preGeneratedQRCodes = qrModule.preGeneratedQRCodes || {};
    } catch (err) {
      console.warn("Failed to load pre-generated QR codes", err);
    }
  }

  // Attach pre-generated QR codes to links
  const linksWithQr = filteredLinks.map((link) => {
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

  // Determine which titles to display
  const titlesToShow = getTitlesToDisplay(hostname, requestedTitles);

  // Build links with QR codes (lazy loads QR file only in qrMode)
  const links = await buildLinksWithQr(allLinks, titlesToShow, qrMode);

  return {
    links,
    qrMode,
    hostname,
  };
}
