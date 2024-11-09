import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = ({ url }) => {
	const hostname = url.hostname;
	const sitemapUrl = `https://${hostname}/sitemap.xml`;
	const robots = [
		"User-agent: *",
		"Allow: /",
		"",
		`Sitemap: ${sitemapUrl}`,
	].join("\n");

	return new Response(robots, {
		headers: {
			"Content-Type": "text/plain",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
