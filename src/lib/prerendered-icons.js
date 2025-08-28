/**
 * Pre-rendered icon components using unplugin-icons
 * These icons are compiled at build time for better performance
 */

// Common icon imports - pre-rendered and optimized
import JamLinkedinCircle from "~icons/jam/linkedin-circle";
import IconoirGithubCircle from "~icons/iconoir/github-circle";
import IconoirTelegramCircle from "~icons/iconoir/telegram-circle";
import RiBlueskyLine from "~icons/ri/bluesky-line";
import TablerFileCv from '~icons/tabler/file-cv';
import IconoirBookStack from "~icons/iconoir/book-stack";
import PhBookmarkSimpleBold from "~icons/ph/bookmark-simple-bold";
import RiInstagramLine from "~icons/ri/instagram-line";

// Export icon map for easy access
export const prerenderedIcons = {
    linkedin: JamLinkedinCircle,
    github: IconoirGithubCircle,
    telegram: IconoirTelegramCircle,
    bluesky: RiBlueskyLine,
    cv: TablerFileCv,
    bookStack: IconoirBookStack,
    bookmark: PhBookmarkSimpleBold,
    instagram: RiInstagramLine,
};

// Export individual icons for direct import
export {
    JamLinkedinCircle,
    IconoirGithubCircle,
    IconoirTelegramCircle,
    RiBlueskyLine,
    TablerFileCv,
    IconoirBookStack,
    PhBookmarkSimpleBold,
    RiInstagramLine,
};

/**
 * Helper function to get a pre-rendered icon by name
 * @param {string} name - The icon name
 * @returns {any} The icon component or null
 */
export function getPrerenderedIcon(name) {
    return prerenderedIcons[/** @type {keyof prerenderedIcons} */ (name)] || null;
}
