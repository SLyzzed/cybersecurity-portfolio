import { getPublishedBlogPosts, getEntryUrl } from "../lib/content";
import { siteConfig } from "../config/site";

export async function GET() {
  const posts = await getPublishedBlogPosts();
  const site = import.meta.env.SITE;

  const items = posts
    .map((post) => {
      const url = new URL(getEntryUrl("blog", post.id), site).toString();
      const date = post.data.updatedDate ?? post.data.date;

      return [
        "<item>",
        `<title>${escapeXml(post.data.title)}</title>`,
        `<description>${escapeXml(post.data.description)}</description>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid>${escapeXml(url)}</guid>`,
        `<pubDate>${date.toUTCString()}</pubDate>`,
        `<dc:creator>${escapeXml(post.data.authorAlias)}</dc:creator>`,
        `<category>${escapeXml(post.data.category)}</category>`,
        ...post.data.tags.map((tag) => `<category>${escapeXml(tag)}</category>`),
        "</item>"
      ].join("");
    })
    .join("");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    `<title>${escapeXml(`${siteConfig.title} Blog`)}</title>`,
    `<description>${escapeXml(siteConfig.description)}</description>`,
    `<link>${escapeXml(new URL(import.meta.env.BASE_URL, site).toString())}</link>`,
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    "</channel>",
    "</rss>"
  ].join("");

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
