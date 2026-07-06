import { defineCollection, z } from "astro:content";

const status = z.enum(["draft", "published", "archived"]);

const sharedSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.coerce.date(),
  status,
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

const projects = defineCollection({
  type: "content",
  schema: sharedSchema.extend({
    repositoryUrl: z.string().url().optional(),
    externalUrl: z.string().url().optional()
  })
});

const writeups = defineCollection({
  type: "content",
  schema: sharedSchema.extend({
    category: z.string().optional()
  })
});

const blog = defineCollection({
  type: "content",
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
