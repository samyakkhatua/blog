# Personal Blog Site (`blog.samyakkhatua.in`)

A lightweight, high-performance static personal blog site built with **Astro**, pulling Markdown articles from a public GitHub repository at build time and deployed on **Cloudflare Pages**.

Designed with clean typography, dark/light theme toggle, syntax highlighting via Shiki, and zero runtime JavaScript bloat.

---

## 🚀 Stack

- **Framework**: [Astro](https://astro.build/) (Static Output)
- **Content Source**: Public GitHub Repository (`.md` files fetched at build time)
- **Syntax Highlighting**: Shiki (`github-dark` & `github-light` themes)
- **Styling**: Vanilla CSS (CSS variables, glassmorphic header, responsive grid, prose typography)
- **Deployment**: Cloudflare Pages (`blog.samyakkhatua.in`)

---

## ⚙️ Configuration

Site settings and content source repository details are configured in a single file: `src/config.ts`.

```typescript
// src/config.ts
export const SITE_CONFIG = {
  title: "Samyak's Blog",
  subtitle: "Software Engineering & Web Development",
  description: "Personal blog articles and technical deep dives.",
  siteUrl: "https://blog.samyakkhatua.in",
  author: {
    name: "Samyak Khatua",
    handle: "samyakkhatua",
    avatar: "https://github.com/samyakkhatua.png",
    bio: "Building software & exploring modern web systems.",
    social: {
      github: "https://github.com/samyakkhatua",
      linkedin: "https://linkedin.com/in/samyakkhatua",
    },
  },
  // Public GitHub repository hosting your Markdown articles
  contentSource: {
    githubUsername: "samyakkhatua",
    repository: "blog-content", // 👈 Change to your content repo name
    branch: "main",
  },
};
```

---

## 📝 How to Add a New Blog Post

1. Open your public content repository (e.g. `github.com/samyakkhatua/blog-content`).
2. Add a new `.md` file (e.g. `my-new-post.md`).
3. Include YAML frontmatter at the top of the file:

```markdown
---
title: "Building Modern Web Applications with Astro"
date: "2026-08-15"
slug: "building-modern-web-applications-with-astro"
summary: "A deep dive into static site generation, performance optimization, and content loader patterns in Astro."
tags: ["Astro", "WebDev", "Performance"]
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
---

Write your article content in Markdown here...

## 1. Introduction

You can write standard Markdown with **bold**, *italics*, lists, images, and code blocks:

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```
```

4. Commit and push the file to the `main` branch of your content repository.
5. Trigger a rebuild on Cloudflare Pages (or set up a GitHub webhook to auto-trigger rebuilds).

---

## 🛠️ Local Development

```bash
# 1. Clone repository
git clone https://github.com/samyakkhatua/blog.git
cd blog-samyak

# 2. Checkout develop branch
git checkout develop

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev
```

Visit `http://localhost:4321` to view your site locally.

---

## 🌴 Git Branch Strategy

- **`develop`**: Primary branch for local development, layout styling, and feature additions.
- **`main`**: Production deployment branch connected to Cloudflare Pages.

---

## ☁️ Cloudflare Pages Build & Deploy Settings

When configuring your site on **Cloudflare Pages**:

| Setting | Value |
| :--- | :--- |
| **Framework preset** | `Astro` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js Version** | `20` or higher (set Environment Variable `NODE_VERSION` = `20.18.0`) |
| **Production Branch** | `main` |
| **Custom Domain** | `blog.samyakkhatua.in` |

### Setting Environment Variables in Cloudflare Pages (Optional)
If your content repository is private or requires rate-limit bypass for build-time API requests:
- `NODE_VERSION`: `20`
