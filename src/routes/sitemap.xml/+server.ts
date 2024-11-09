export async function GET() {
	const pages = ["https://morganwill.com", "https://zenfo.co"];

	const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
				.map(
					(page) => `
        <url>
          <loc>${page}</loc>
          <changefreq>monthly</changefreq>
          <priority>0.7</priority>
        </url>
      `
				)
				.join("")}
    </urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
		},
	});
}
