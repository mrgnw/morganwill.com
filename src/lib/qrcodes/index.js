// Factory function to dynamically import QR codes on demand
export async function getQRCode(title) {
  try {
    const module = await import(`./${title}.js`);
    return module.default;
  } catch (err) {
    console.warn(`Failed to load QR code for ${title}`, err);
    return null;
  }
}

// Pre-load function for known titles
export async function getQRCodes(titles) {
  const qrCodes = {};

  for (const title of titles) {
    const qr = await getQRCode(title);
    if (qr) {
      qrCodes[title] = qr;
    }
  }

  return qrCodes;
}
