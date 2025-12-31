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

/**
 * @typedef {Object} CustomLinkDefinition
 * @property {string} type - The link type (matches template title)
 * @property {string} value - The value to use (e.g., phone number, username)
 * @property {string} [name] - Optional custom title/name
 * @property {string} [alias] - Optional custom alias
 */

/**
 * Parse CUSTOM_LINKS JSON from environment and generate link templates
 * @param {string | null | undefined} customLinksJson - JSON string from env var
 * @param {Map<string, number>} existingCounts - Map of type to count of existing links
 * @returns {LinkTemplate[]} - Array of custom link templates
 */
export function parseCustomLinks(customLinksJson, existingCounts) {
	if (!customLinksJson) return [];

	try {
		/** @type {CustomLinkDefinition[]} */
		const customLinks = JSON.parse(customLinksJson);

		if (!Array.isArray(customLinks)) {
			console.warn("CUSTOM_LINKS must be an array");
			return [];
		}

		// Track how many custom links we've added per type
		/** @type {Map<string, number>} */
		const customCounts = new Map();

		return customLinks
			.map((custom) => {
				// Find the base template for this type
				const baseTemplate = linkTemplates.find((t) => t.title === custom.type);

				if (!baseTemplate) {
					console.warn(`Unknown link type: ${custom.type}`);
					return null;
				}

				// Determine name and alias
				let name = custom.name;
				let alias = custom.alias;

				if (!name || !alias) {
					// Calculate the suffix number
					const existingCount = existingCounts.get(custom.type) || 0;
					const customCount = customCounts.get(custom.type) || 0;
					const totalCount = existingCount + customCount;

					if (totalCount === 0) {
						// First link of this type - use default name and alias
						name = name || baseTemplate.title;
						alias = alias || baseTemplate.alias;
					} else {
						// Additional link - add number suffix
						const suffix = totalCount + 1;
						name = name || `${baseTemplate.title}${suffix}`;
						alias = alias || `${baseTemplate.alias}${suffix}`;
					}
				}

				// Increment custom count for this type
				customCounts.set(custom.type, (customCounts.get(custom.type) || 0) + 1);

				// Create a new template with the custom value hardcoded as env var
				return {
					title: name,
					alias: alias,
					urlTemplate: baseTemplate.urlTemplate,
					url: baseTemplate.url,
					blurb: baseTemplate.blurb,
					colors: baseTemplate.colors,
					strokeIcon: baseTemplate.strokeIcon,
					envVar: `__CUSTOM_${name.toUpperCase()}__`, // Special env var marker
					__customValue: custom.value, // Store the value directly
				};
			})
			.filter(Boolean);
	} catch (error) {
		console.warn("Failed to parse CUSTOM_LINKS:", error);
		return [];
	}
}
