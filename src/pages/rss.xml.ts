import rss from '@astrojs/rss';
import { getAllPosts } from '../lib/posts';
import { SITE_CONFIG } from '../config';

export async function GET() {
  const posts = await getAllPosts();
  return rss({
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: SITE_CONFIG.siteUrl,
    items: posts.map((post) => ({
      title: post.frontmatter.title,
      pubDate: new Date(post.frontmatter.date),
      description: post.frontmatter.summary,
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
