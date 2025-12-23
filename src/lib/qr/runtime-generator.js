import QRCode from "qrcode";

/**
 * Shuffle array with seeded random for consistent results
 * @param {string[]} array
 * @param {number} seed
 * @returns {string[]}
 */
function shuffleWithSeed(array, seed) {
  const shuffled = [...array];
  let rng = seed;

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Seeded random: linear congruential generator
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    const j = Math.floor((rng / 0x7fffffff) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Generate an optimized SVG with individual rects for animation
 * Uses seeded shuffling for consistent animation order across reloads
 * @param {string} text - Text to encode
 * @param {number} size - SVG size in pixels
 * @returns {string} SVG string with rect elements
 */
export function generateQRSvg(text, size = 164) {
  const qr = QRCode.create(text);
  const modules = qr.modules;
  const moduleCount = modules.size;
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

  // Shuffle rects using seeded random (seed from text hash for consistency)
  const seed = text
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const shuffled = shuffleWithSeed(rects, seed);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow:visible">${shuffled.join("")}</svg>`;
}

/**
 * Cache for generated QR codes to avoid regenerating the same URL
 * @type {Map<string, string>}
 */
const qrCache = new Map();

/**
 * Generate or retrieve from cache a QR code SVG
 * Useful for dynamic/runtime-generated URLs that aren't pre-generated
 * @param {string} url
 * @param {number} size - SVG size in pixels (default 164)
 * @returns {string} SVG string
 */
export function getOrGenerateQRSvg(url, size = 164) {
  const cacheKey = `${url}:${size}`;

  if (qrCache.has(cacheKey)) {
    return qrCache.get(cacheKey) || generateQRSvg(url, size);
  }

  const svg = generateQRSvg(url, size);
  qrCache.set(cacheKey, svg);
  return svg;
}

/**
 * Clear the QR code cache
 */
export function clearQRCache() {
  qrCache.clear();
}

/**
 * Get cache statistics
 * @returns {{ size: number, entries: string[] }}
 */
export function getQRCacheStats() {
  return {
    size: qrCache.size,
    entries: Array.from(qrCache.keys()),
  };
}
