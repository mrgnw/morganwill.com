export async function onRequest(context: any) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Get the response from the next handler
  let response = await context.next();

  // Clone the response so we can modify headers
  const newResponse = new Response(response.body, response);

  // Cloudflare caches based on Cache-Control + file extension/path patterns
  // For Cloudflare Workers, we need to be explicit about what gets cached

  if (
    pathname.match(/\/_app\/immutable\//) ||
    pathname.match(/\.(js|css|woff2|ttf|otf|eot)$/i)
  ) {
    // Immutable/versioned assets - cache for 1 year at edge and browser
    // Cloudflare will cache these because they're static with hash in filename
    newResponse.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable",
    );
  } else if (pathname.match(/\.(png|jpg|jpeg|gif|webp|ico|svg)$/i)) {
    // Images - cache for 30 days
    newResponse.headers.set("Cache-Control", "public, max-age=2592000");
  } else if (
    pathname === "/" ||
    pathname.match(/\.html$/i) ||
    pathname.match(/\/apple|\/imessage/)
  ) {
    // HTML pages - short cache with revalidation
    // This tells Cloudflare to cache but check for updates frequently
    newResponse.headers.set(
      "Cache-Control",
      "public, max-age=3600, must-revalidate",
    );
    // Add cache tags for Cloudflare Cache Purge API (if using Cloudflare Pages)
    newResponse.headers.set("Cache-Tag", "html-pages");
  } else if (pathname.match(/manifest|browserconfig|robots|sitemap/i)) {
    // Metadata files - moderate cache
    newResponse.headers.set("Cache-Control", "public, max-age=86400");
  } else {
    // Default for unknown routes - 1 hour
    newResponse.headers.set("Cache-Control", "public, max-age=3600");
  }

  return newResponse;
}
