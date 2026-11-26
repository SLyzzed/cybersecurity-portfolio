import { sitePath } from "./content";

export interface ProjectPageConfig {
  title: string;
  slug: string;
  order: number;
  template?: "default" | "incident-scenario" | "investigation" | "incident-report" | "runbook" | "lessons-learned";
}

export interface ProjectConfig {
  name: string;
  slug: string;
  description: string;
  status: "draft" | "published" | "archived";
  category: string;
  pages: ProjectPageConfig[];
}

const configModules = import.meta.glob<ProjectConfig>("../config/projects/*.json", {
  eager: true,
  import: "default"
});

const projectConfigs = new Map(
  Object.values(configModules).map((config) => [config.slug, validateProjectConfig(config)])
);

export function getProjectConfig(slug: string) {
  return projectConfigs.get(slug);
}

export function getProjectPageUrl(projectSlug: string, pageSlug?: string) {
  const suffix = pageSlug && pageSlug !== "overview" ? `/${pageSlug}` : "";
  return sitePath(`/projects/${projectSlug}${suffix}/`);
}

function validateProjectConfig(config: ProjectConfig) {
  if (!config.name || !config.slug || !config.description || !config.category) {
    throw new Error("Project configuration is missing required metadata.");
  }
  const slugs = new Set<string>();
  const orders = new Set<number>();
  for (const page of config.pages) {
    if (!page.title || !page.slug || !Number.isInteger(page.order) || page.order < 0) {
      throw new Error(`Invalid page configuration in project '${config.slug}'.`);
    }
    if (slugs.has(page.slug) || orders.has(page.order)) {
      throw new Error(`Duplicate page slug or navigation order in project '${config.slug}'.`);
    }
    slugs.add(page.slug);
    orders.add(page.order);
  }
  return { ...config, pages: [...config.pages].sort((a, b) => a.order - b.order) };
}
