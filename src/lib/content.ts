import { getCollection } from "astro:content";

export type CollectionName = "projects" | "writeups" | "blog";

export async function getPublishedEntries(collection: CollectionName) {
  const entries = await getCollection(collection, ({ data }) => data.status === "published");

  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getFeaturedEntries() {
  const [projects, writeups, blog] = await Promise.all([
    getPublishedEntries("projects"),
    getPublishedEntries("writeups"),
    getPublishedEntries("blog")
  ]);

  return [
    ...projects.map((entry) => ({ ...entry, collection: "projects" as const })),
    ...writeups.map((entry) => ({ ...entry, collection: "writeups" as const })),
    ...blog.map((entry) => ({ ...entry, collection: "blog" as const }))
  ]
    .filter((entry) => entry.data.featured)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPublishedBlogPosts() {
  return getPublishedEntries("blog");
}

export function estimateReadingTime(markdown: string) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 225));
}

export function slugifyFilter(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getBlogCategories(posts: Awaited<ReturnType<typeof getPublishedBlogPosts>>) {
  return uniqueBySlug(posts.map((post) => post.data.category));
}

export function getBlogTags(posts: Awaited<ReturnType<typeof getPublishedBlogPosts>>) {
  return uniqueBySlug(posts.flatMap((post) => post.data.tags));
}

export function getAdjacentPosts(posts: Awaited<ReturnType<typeof getPublishedBlogPosts>>, slug: string) {
  const index = posts.findIndex((post) => post.slug === slug);

  return {
    previous: index >= 0 ? posts[index + 1] : undefined,
    next: index > 0 ? posts[index - 1] : undefined
  };
}

export function getRelatedPosts(
  posts: Awaited<ReturnType<typeof getPublishedBlogPosts>>,
  slug: string,
  tags: string[],
  limit = 3
) {
  const tagSet = new Set(tags.map((tag) => tag.toLowerCase()));

  return posts
    .filter((post) => post.slug !== slug)
    .map((post) => ({
      post,
      score: post.data.tags.filter((tag) => tagSet.has(tag.toLowerCase())).length
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.date.valueOf() - a.post.data.date.valueOf())
    .slice(0, limit)
    .map((item) => item.post);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}

export function getEntryUrl(collection: CollectionName, slug: string) {
  return sitePath(`/${collection}/${slug}/`);
}

export function sitePath(pathname: string) {
  const base = import.meta.env.BASE_URL;
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  return `${cleanBase}${cleanPath}`;
}

function uniqueBySlug(values: string[]) {
  const items = new Map<string, string>();

  for (const value of values) {
    const slug = slugifyFilter(value);
    if (slug && !items.has(slug)) {
      items.set(slug, value);
    }
  }

  return [...items.entries()].map(([slug, label]) => ({ slug, label }));
}
