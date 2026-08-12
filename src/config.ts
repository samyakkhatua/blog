export interface SiteConfig {
  title: string;
  subtitle: string;
  description: string;
  siteUrl: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    bio: string;
    social: {
      github?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
  contentSource: {
    githubUsername: string;
    repository: string;
    branch: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
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
  // Content repository where your .md files live
  contentSource: {
    githubUsername: "samyakkhatua",
    repository: "blog-content", // Replace with your public content repo name
    branch: "main",
  },
};
