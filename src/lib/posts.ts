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

// Sample fallback post in case GitHub repo is not yet reachable or empty
const FALLBACK_POSTS: PostRaw[] = [
  {
    path: 'react-fundamentals-components-jsx-state-and-re-rendering.md',
    content: `---
title: "React Fundamentals: Components, JSX, State, and Re-rendering"
date: "2026-08-10"
slug: "react-fundamentals-components-jsx-state-and-re-rendering"
summary: "Understand the four core pillars of React development: components, JSX, state, and re-rendering with practical mental models and code examples."
tags: ["React", "JavaScript", "Frontend"]
coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop"
---

If you've ever visited a website where clicking a button updated the page instantly—no refresh, no loading spinner, no blank screen—you've experienced React doing what it does best. React didn't just change how we build user interfaces; it changed how we *think* about them.

Instead of manually hunting through the DOM and patching it, you describe what the UI should look like for any given state, and React handles the messy work of getting the browser there.

## 1. Components: The Building Blocks

Think of components like LEGO bricks. A LEGO castle isn't one giant plastic blob—it's hundreds of small, reusable pieces snapped together. React applications work exactly the same way. A component is a self-contained, reusable piece of UI that manages its own structure and behavior.

Here's the simplest component you can write:

\`\`\`javascript
function Greeting() {
  return <h1>Hello, Developer!</h1>;
}
\`\`\`

That's it. A function that returns UI. The name **must** start with a capital letter—React uses this convention to distinguish components from regular HTML tags.

### Components Accept Props

Static components are fine, but the real power shows up when components become configurable. That's what **props** (short for properties) are for:

\`\`\`javascript
function ProfileCard({ name, role }) {
  return (
    <div className="profile-card">
      <h2>{name}</h2>
      <p>Role: {role}</p>
    </div>
  );
}
\`\`\`

## 2. JSX: HTML That Thinks

JSX looks like HTML, but it plays by JavaScript's rules. Under the hood, build tools transform it into plain JavaScript calls.

\`\`\`typescript
const user = { name: "Samyak", role: "Engineer" };

function UserCard() {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.role}</p>
    </div>
  );
}
\`\`\`

## 3. State: A Component's Memory

Props make components configurable. **State** makes them *alive*.

\`\`\`javascript
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

### The Golden Rule: Never Mutate State Directly

\`\`\`javascript
// ❌ WRONG — React won't re-render
count = count + 1;

// ✅ RIGHT — Schedules state update & re-renders UI
setCount(count + 1);
\`\`\`

## 4. Re-rendering: How React Stays Fast

> **A render is React calling your component function again to figure out what the UI should look like now.**

When state changes, React compares the new virtual DOM tree with the previous one and patches only the changed elements in the real DOM.

## Key Takeaways

1. **Components** encapsulate UI logic and structure.
2. **JSX** combines HTML syntax with JavaScript power.
3. **State** represents dynamic data that triggers UI updates.
4. **Re-rendering** relies on virtual DOM diffing for optimal performance.
`
  },
  {
    path: 'welcome-to-my-blog.md',
    content: `---
title: "Welcome to My Personal Blog"
date: "2026-08-01"
slug: "welcome-to-my-blog"
summary: "An introduction to this static blog powered by Astro and GitHub Markdown content."
tags: ["Meta", "Astro", "Blog"]
---

Welcome to my personal blog!

This blog is built using **Astro** and deployed as a static website on **Cloudflare Pages**.

### How It Works

- Article Markdown files live in a public GitHub repository.
- During build time, Astro fetches the \`.md\` files via GitHub API.
- Articles are rendered with syntax highlighting powered by Shiki.

Stay tuned for more articles on web development, system design, and software engineering!
`
  }
];

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

export async function fetchRawMarkdownFiles(): Promise<{ rawPosts: PostRaw[]; isFallback: boolean }> {
  const { githubUsername, repository, branch } = SITE_CONFIG.contentSource;
  
  if (!githubUsername || !repository) {
    return { rawPosts: FALLBACK_POSTS, isFallback: true };
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
      console.warn(`[Blog Content] GitHub API returned ${response.status} for ${apiUrl}. Using fallback content.`);
      return { rawPosts: FALLBACK_POSTS, isFallback: true };
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      return { rawPosts: FALLBACK_POSTS, isFallback: true };
    }

    const mdFiles = files.filter((f: any) => f.type === 'file' && (f.name.endsWith('.md') || f.name.endsWith('.mdx')));

    if (mdFiles.length === 0) {
      console.warn('[Blog Content] No .md files found in target repo. Using fallback content.');
      return { rawPosts: FALLBACK_POSTS, isFallback: true };
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

    return { rawPosts, isFallback: false };
  } catch (err) {
    console.error('[Blog Content] Error fetching posts from GitHub:', err);
    return { rawPosts: FALLBACK_POSTS, isFallback: true };
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const { rawPosts } = await fetchRawMarkdownFiles();
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
