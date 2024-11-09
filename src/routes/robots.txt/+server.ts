import type { RequestHandler } from "@sveltejs/kit";

export const prerender = true;

export const GET: RequestHandler = async ({ url }) => {
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
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
			"X-Content-Type-Options": "nosniff",
		},
	});
};
