import Product from "../models/Product.js";

// @route GET /sitemap.xml
// Dynamically generates a sitemap listing every public page — search
// engines fetch this periodically to discover pages to crawl/index
export const generateSitemap = async (req, res) => {
  try {
    const products = await Product.find().select("_id updatedAt").lean();

    const staticUrls = [
      { loc: "/", priority: "1.0" },
      { loc: "/login", priority: "0.3" },
      { loc: "/register", priority: "0.3" },
    ];

    const productUrls = products.map((p) => ({
      loc: `/products/${p._id}`,
      lastmod: p.updatedAt.toISOString().split("T")[0],
      priority: "0.8",
    }));

    const allUrls = [...staticUrls, ...productUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `  <url>
    <loc>${process.env.CLIENT_URL}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
};
