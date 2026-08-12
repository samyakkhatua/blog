import matter from 'gray-matter';
import { marked } from 'marked';
import { createHighlighter } from 'shiki';
import { SITE_CONFIG } from '../config';

export interface PostFrontmatter {
  title: string;
  date: string;
  updated?: string;
  slug: string;
  summary?: string;
  tags?: string[];
  coverImage?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
  html: string;
  slug: string;
  readTime: string;
  toc: TocItem[];
  rawUrl: string;
}

interface PostRaw {
  path: string;
  content: string;
}

let shikiHighlighter: any = null;

async function getShiki() {
  if (!shikiHighlighter) {
    shikiHighlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'jsx', 'tsx', 'html', 'css', 'json', 'bash', 'yaml', 'markdown', 'python', 'go', 'rust', 'c', 'cpp', 'shell']
    });
  }
  return shikiHighlighter;
}

function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const cleanContent = content.replace(/```[\s\S]*?```/g, '').replace(/[#*`_]/g, '');
  const words = cleanContent.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function fetchRawMarkdownFiles(): Promise<{ rawPosts: PostRaw[] }> {
  const { githubUsername, repository, branch } = SITE_CONFIG.contentSource;
  
  if (!githubUsername || !repository) {
    return { rawPosts: [] };
  }

  try {
    const apiUrl = `https://api.github.com/repos/${githubUsername}/${repository}/contents?ref=${branch}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Astro-Blog-Builder'
      }
    });

    if (!response.ok) {
      console.warn(`[Blog Content] GitHub API returned ${response.status} for ${apiUrl}. No remote posts found.`);
      return { rawPosts: [] };
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      return { rawPosts: [] };
    }

    const mdFiles = files.filter((f: any) => f.type === 'file' && (f.name.endsWith('.md') || f.name.endsWith('.mdx')));

    if (mdFiles.length === 0) {
      console.warn('[Blog Content] No .md files found in target repo.');
      return { rawPosts: [] };
    }

    const rawPosts: PostRaw[] = await Promise.all(
      mdFiles.map(async (file: any) => {
        const rawUrl = file.download_url || `https://raw.githubusercontent.com/${githubUsername}/${repository}/${branch}/${file.path}`;
        const res = await fetch(rawUrl);
        const text = await res.text();
        return {
          path: file.name,
          content: text
        };
      })
    );

    return { rawPosts };
  } catch (err) {
    console.error('[Blog Content] Error fetching posts from GitHub:', err);
    return { rawPosts: [] };
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const { rawPosts } = await fetchRawMarkdownFiles();
  if (rawPosts.length === 0) return [];

  const highlighter = await getShiki();
  const posts: Post[] = [];

  for (const raw of rawPosts) {
    const { data, content } = matter(raw.content);
    
    const filenameSlug = raw.path.replace(/\.(md|mdx)$/, '');
    const slug = data.slug || filenameSlug;

    const toc: TocItem[] = [];

    const customRenderer = {
      heading({ text, depth }: { text: string; depth: number }) {
        const cleanText = text.replace(/<[^>]*>/g, '');
        const id = slugify(cleanText);
        toc.push({ id, text: cleanText, level: depth });
        return `<h${depth} id="${id}">${text}</h${depth}>`;
      },
      code({ text, lang }: { text: string; lang?: string }) {
        const language = (lang || 'text').toLowerCase();
        let highlighted = '';
        try {
          const loadedLangs = highlighter.getLoadedLanguages();
          const activeLang = loadedLangs.includes(language) ? language : 'text';
          highlighted = highlighter.codeToHtml(text, {
            lang: activeLang,
            themes: {
              light: 'github-light',
              dark: 'github-dark'
            }
          });
        } catch {
          highlighted = `<pre><code>${escapeHtml(text)}</code></pre>`;
        }

        return `<div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-lang">${language}</span>
            <button class="copy-code-btn" aria-label="Copy code">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
          </div>
          ${highlighted}
        </div>`;
      }
    };

    marked.use({ renderer: customRenderer as any });
    const html = await marked.parse(content);

    const frontmatter: PostFrontmatter = {
      title: data.title || 'Untitled Post',
      date: data.date ? formatDate(data.date) : 'Undated',
      updated: data.updated ? formatDate(data.updated) : undefined,
      slug,
      summary: data.summary || data.description || extractExcerpt(content),
      tags: Array.isArray(data.tags) ? data.tags : [],
      coverImage: data.coverImage || data.cover_image || data.cover
    };

    const { githubUsername, repository, branch } = SITE_CONFIG.contentSource;
    const rawUrl = `https://github.com/${githubUsername}/${repository}/blob/${branch}/${raw.path}`;

    posts.push({
      frontmatter,
      content,
      html: html as string,
      slug,
      readTime: calculateReadingTime(content),
      toc,
      rawUrl
    });
  }

  return posts.sort((a, b) => {
    const timeA = new Date(a.frontmatter.date).getTime() || 0;
    const timeB = new Date(b.frontmatter.date).getTime() || 0;
    return timeB - timeA;
  });
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug);
}

function extractExcerpt(markdown: string): string {
  const clean = markdown
    .replace(/^---[\s\S]*?---/, '')
    .replace(/#+\s+/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim();
  return clean.slice(0, 160) + (clean.length > 160 ? '...' : '');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
