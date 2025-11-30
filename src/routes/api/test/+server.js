import { env } from '$env/dynamic/private';
import { links as all_links } from '$lib/links.js';

/** @typedef {import('$lib/links.js').Link} Link */

/**
 * Build private links from environment variables
 * @returns {Link[]}
 */
function getPrivateLinks() {
  /** @type {Link[]} */
  const privateLinks = [];

  if (env.PHONE_NUMBER) {
    privateLinks.push({
      title: "phone",
      alias: "ph",
      url: `tel:${env.PHONE_NUMBER}`,
      shortUrl: `tel:${env.PHONE_NUMBER}`,
      blurb: "Call me",
      colors: ["#34c759", "#28a745"],
    });
  }

  if (env.WHATSAPP_NUMBER) {
    const waNumber = env.WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
    privateLinks.push({
      title: "whatsapp",
      alias: "wa",
      url: `https://wa.me/${waNumber}`,
      shortUrl: `https://wa.me/${waNumber}`,
      blurb: "Message on WhatsApp",
      colors: ["#25D366", "#128C7E"],
    });
  }

  return privateLinks;
}

/**
 * Get filtered links based on URL params
 * @param {Link[]} allLinks
 * @param {URLSearchParams} urlParams
 * @returns {{ links: Link[], qrMode: boolean, debug: object }}
 */
function getFilteredLinks(allLinks, urlParams) {
  const linksParam = urlParams.get("links");
  const paramKeys = [...urlParams.keys()];
  const expandedKeys = paramKeys.flatMap((key) => key.split(/[.,]/));
  const qrMode = urlParams.has("qr") || expandedKeys.includes("qr");

  const matchingKeys = expandedKeys.filter(
    (key) =>
      key !== "qr" &&
      allLinks.some((link) => link.title === key || link.alias === key),
  );

  const debug = {
    paramKeys,
    expandedKeys,
    matchingKeys,
    allLinkAliases: allLinks.map(l => ({ title: l.title, alias: l.alias })),
  };

  let links;
  if (linksParam) {
    const requestedLinks = linksParam
      .split(/[.,]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s !== "qr");
    links = requestedLinks
      .map((key) =>
        allLinks.find((link) => link.title === key || link.alias === key),
      )
      .filter(Boolean);
  } else if (matchingKeys.length > 0) {
    links = matchingKeys
      .map((key) =>
        allLinks.find((link) => link.title === key || link.alias === key),
      )
      .filter(Boolean);
  } else {
    links = allLinks;
  }

  return { links, qrMode, debug };
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const privateLinks = getPrivateLinks();
  const combinedLinks = [...all_links, ...privateLinks];

  const { links, qrMode, debug } = getFilteredLinks(combinedLinks, url.searchParams);

  return new Response(JSON.stringify({
    envCheck: {
      hasPhoneNumber: !!env.PHONE_NUMBER,
      hasWhatsappNumber: !!env.WHATSAPP_NUMBER,
    },
    privateLinksCount: privateLinks.length,
    combinedLinksCount: combinedLinks.length,
    filteredLinksCount: links.length,
    filteredLinks: links.map(l => ({ title: l.title, alias: l.alias })),
    qrMode,
    debug,
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
