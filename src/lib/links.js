/**
 * @typedef {Object} Link
 * @property {string} title
 * @property {string} alias
 * @property {string} url
 * @property {string} blurb
 * @property {string[]} colors
 * @property {string} [qr]
 * @property {boolean} [strokeIcon]
 */

/**
 * @typedef {Object} LinkTemplate
 * @property {string} title - Unique identifier for the link type
 * @property {string} alias - Short alias for URL params
 * @property {string} [urlTemplate] - URL template with {value} placeholder (omit for hardcoded)
 * @property {string} [url] - Hardcoded URL (for non-overridable links like blog, email)
 * @property {string} blurb - Display description
 * @property {string[]} colors - Brand colors
 * @property {boolean} [strokeIcon] - Icon uses stroke instead of fill
 * @property {string} [envVar] - Environment variable name for the value
 */

/** @type {LinkTemplate[]} */
export const linkTemplates = [
  {
    title: "instagram",
    alias: "ig",
    url: "https://instagram.com/zenfo.co",
    blurb: "Instagram photo portfolio",
    colors: ["#833ab4", "#fd1d1d", "#fcb045"],
  },
  {
    title: "linkedin",
    alias: "li",
    url: "https://linkedin.com/in/mrgnw",
    blurb: "LinkedIn profile",
    colors: ["#0A66C2", "#004182"],
  },
  {
    title: "github",
    alias: "gh",
    url: "https://github.com/mrgnw",
    blurb: "GitHub profile",
    colors: ["#6e5494", "#24292e"],
    strokeIcon: true,
  },
  {
    title: "blog",
    alias: "blog",
    url: "https://blog.morganwill.com",
    blurb: "Blog",
    colors: ["#ff6b6b", "#ee5a24"],
  },
  {
    title: "bluesky",
    alias: "bsky",
    url: "https://bsky.app/profile/xcc.es",
    blurb: "Bluesky profile",
    colors: ["#0085ff", "#00c2ff"],
  },
  {
    title: "discord",
    alias: "dsc",
    url: "http://discordapp.com/users/mrgnw#5838",
    blurb: "Message on Discord",
    colors: ["#5865F2", "#404EED"],
  },
  {
    title: "telegram",
    alias: "tg",
    url: "https://t.me/mrgnw",
    blurb: "Message on Telegram",
    colors: ["#26A5E4", "#0088cc"],
    strokeIcon: true,
  },
  {
    title: "phone",
    alias: "phone",
    urlTemplate: "sms:{value}",
    blurb: "Text me",
    colors: ["#34c759", "#28a745"],
    envVar: "PHONE_NUMBER",
  },
  {
    title: "whatsapp",
    alias: "wa",
    urlTemplate: "https://wa.me/{value}",
    blurb: "Message on WhatsApp",
    colors: ["#25D366", "#128C7E"],
    envVar: "WHATSAPP_NUMBER",
  },
  {
    title: "line",
    alias: "ln",
    urlTemplate: "https://line.me/ti/p/~{value}",
    blurb: "Message on LINE",
    colors: ["#00B900", "#009C00"],
    strokeIcon: true,
    envVar: "LINE_ID",
  },
  {
    title: "signal",
    alias: "sig",
    urlTemplate: "https://signal.me/#p/{value}",
    blurb: "Message on Signal",
    colors: ["#3A76F0", "#2D5FBE"],
    strokeIcon: true,
    envVar: "SIGNAL_ID",
  },
];

/**
 * @typedef {Object} Link
 * @property {string} title
 * @property {string} alias
 * @property {string} url
 * @property {string} blurb
 * @property {string[]} colors
 * @property {string} [qr]
 * @property {boolean} [strokeIcon]
 */

/**
 * Build a link from a template, with value from env var or param
 * @param {LinkTemplate} template
 * @param {string | null} paramValue - Value from URL params
 * @param {string | null} envValue - Value from environment variable
 * @returns {Link | null} - Returns null if no value is available
 */
export function buildLink(template, paramValue, envValue) {
  // Priority: params > env > hardcoded url
  let value = paramValue ?? envValue;

  // If we have a hardcoded URL, use it (no template needed)
  if (template.url) {
    return {
      title: template.title,
      alias: template.alias,
      url: template.url,
      blurb: template.blurb,
      colors: template.colors,
      strokeIcon: template.strokeIcon,
    };
  }

  // If we have a template, we need a value
  if (template.urlTemplate) {
    // For WhatsApp, strip non-numeric characters from the value
    if (template.title === "whatsapp" && value) {
      value = value.replace(/[^0-9]/g, "");
    }

    // Only return link if we have a value
    if (value) {
      return {
        title: template.title,
        alias: template.alias,
        url: template.urlTemplate.replace("{value}", value),
        blurb: template.blurb,
        colors: template.colors,
        strokeIcon: template.strokeIcon,
      };
    }
  }

  return null;
}
