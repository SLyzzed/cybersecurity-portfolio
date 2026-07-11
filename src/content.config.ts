import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const status = z.enum(["draft", "published", "archived"]);
const contentId = ({ entry }: { entry: string }) =>
  entry.replace(/\.(?:md|mdx)$/i, "").replaceAll("\\", "/");

const sharedSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  status,
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects", generateId: contentId }),
  schema: sharedSchema.extend({
    repositoryUrl: z.string().url().optional(),
    externalUrl: z.string().url().optional(),
    projectSlug: z.string().min(1).optional(),
    pageType: z.enum(["landing", "subpage"]).optional(),
    navigationTitle: z.string().min(1).optional(),
    navigationOrder: z.number().int().nonnegative().optional(),
    category: z.string().min(1).optional()
  })
});

const writeups = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/writeups", generateId: contentId }),
  schema: sharedSchema.extend({
    category: z.string().optional()
  })
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog", generateId: contentId }),
  schema: sharedSchema.extend({
    updatedDate: z.coerce.date().optional(),
    authorAlias: z.string().min(1),
    category: z.string().min(1),
    coverImage: z.string().optional()
  })
});

export const collections = {
  projects,
  writeups,
  blog
};
