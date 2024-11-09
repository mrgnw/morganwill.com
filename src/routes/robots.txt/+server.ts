export async function GET({ url }) {
	const hostname = url.hostname;
	const sitemapUrl = `https://${hostname}/sitemap.xml`;
	const robots = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}`;

	return new Response(robots, {
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
