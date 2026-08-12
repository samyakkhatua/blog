import { getAllPosts } from '../lib/posts';
import { SITE_CONFIG } from '../config';

export async function GET() {
  const posts = await getAllPosts();
  const baseUrl = SITE_CONFIG.siteUrl;

  const pages = [
    { url: `${baseUrl}/`, lastmod: new Date().toISOString() },
    ...posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}/`,
      lastmod: new Date(post.frontmatter.date).toISOString(),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page.url === `${baseUrl}/` ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
