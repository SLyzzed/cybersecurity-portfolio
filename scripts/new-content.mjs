import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const type = process.argv[2];
const args = process.argv.slice(3);

const usage = [
  "Usage:",
  "  npm run new:project -- --title \"Home SIEM Lab\" --description \"Short summary\"",
  "  npm run new:project -- --structured --title \"Home SIEM Lab\" --description \"Short summary\" --category \"Security Engineering\" --subpages \"Architecture:architecture,Runbooks:runbooks:runbook\"",
  "  npm run new:writeup -- --title \"Deploying Wazuh Agents\" --description \"Short summary\"",
  "  npm run new:blog -- --title \"Detection Notes\" --description \"Short summary\""
].join("\n");

if (!["project", "writeup", "blog"].includes(type)) {
  fail(usage);
}

const options = parseArgs(args);
const title = options.title;
const description = options.description ?? "Add a short description before publishing.";

if (!title) {
  fail(`Missing --title.\n${usage}`);
}

const slug = options.slug ?? slugify(title);
const date = options.date ?? new Date().toISOString().slice(0, 10);
const root = process.cwd();

if (type === "project" && options.structured === "true") {
  createStructuredProject({ root, title, description, slug, date, options });
  process.exit(0);
}

const contentTypes = {
  project: {
    collection: "projects",
    templateName: "new-project.md"
  },
  writeup: {
    collection: "writeups",
    templateName: "new-writeup.md"
  },
  blog: {
    collection: "blog",
    templateName: "new-blog-post.md"
  }
};
const { collection, templateName } = contentTypes[type];
const templatePath = path.join(root, "templates", templateName);
const outputPath = path.join(root, "src", "content", collection, `${slug}.md`);

if (!fs.existsSync(templatePath)) {
  fail(`Template not found: ${templatePath}`);
}

if (fs.existsSync(outputPath)) {
  fail(`Content file already exists: ${outputPath}`);
}

const rendered = fs
  .readFileSync(templatePath, "utf8")
  .replaceAll("{{title}}", escapeYamlString(title))
  .replaceAll("{{description}}", escapeYamlString(description))
  .replaceAll("{{date}}", date)
  .replaceAll(
    "{{authorAlias}}",
    escapeYamlString(options.authorAlias ?? process.env.BLOG_AUTHOR_ALIAS ?? "Archive Operator")
  );

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, rendered, "utf8");

console.log(`Created ${path.relative(root, outputPath)}`);

function createStructuredProject({ root, title, description, slug, date, options }) {
  const status = options.status ?? "draft";
  if (!["draft", "published", "archived"].includes(status)) {
    fail("--status must be draft, published, or archived.");
  }
  const category = options.category ?? "Cybersecurity Project";
  const requestedPages = parseSubpages(options.subpages ?? "Architecture:architecture,Lessons Learned:lessons-learned:lessons-learned,Roadmap:roadmap")
    .map((page, index) => ({ ...page, order: index + 1 }));
  const pages = [{ title: "Overview", slug: "overview", order: 0 }, ...requestedPages];
  const projectDir = path.join(root, "src", "content", "projects", slug);
  const configDir = path.join(root, "src", "config", "projects");
  const configPath = path.join(configDir, `${slug}.json`);

  if (fs.existsSync(projectDir) || fs.existsSync(configPath)) {
    fail(`Structured project already exists: ${slug}`);
  }

  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(configDir, { recursive: true });
  const config = { name: title, slug, description, status, category, pages };
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

  const landingBody = readProjectPageTemplate(root, "overview");
  fs.writeFileSync(
    path.join(projectDir, "overview.md"),
    structuredMarkdown({ title, description, date, status, slug, pageType: "landing", navigationTitle: "Overview", navigationOrder: 0, category, body: landingBody }),
    "utf8"
  );

  for (const page of requestedPages) {
    const body = readProjectPageTemplate(root, page.template ?? "default");
    fs.writeFileSync(
      path.join(projectDir, `${page.slug}.md`),
      structuredMarkdown({ title: `${title}: ${page.title}`, description: `${page.title} documentation for ${title}.`, date, status, slug, pageType: "subpage", navigationTitle: page.title, navigationOrder: page.order, category, body }),
      "utf8"
    );
  }

  console.log(`Created structured project: ${path.relative(root, projectDir)}`);
  console.log(`Created project configuration: ${path.relative(root, configPath)}`);
}

function parseSubpages(value) {
  const pages = value.split(",").map((item) => {
    const [rawTitle, rawSlug, template] = item.split(":").map((part) => part?.trim());
    const title = rawTitle;
    const slug = rawSlug || slugify(title ?? "");
    if (!title || !slug) {
      fail(`Invalid --subpages entry: ${item}`);
    }
    return { title, slug, ...(template ? { template } : {}) };
  });
  const slugs = pages.map((page) => page.slug);
  if (new Set(slugs).size !== slugs.length || slugs.includes("overview")) {
    fail("Subpage slugs must be unique and cannot use 'overview'.");
  }
  return pages;
}

function readProjectPageTemplate(root, template) {
  const allowed = new Set(["default", "overview", "incident-scenario", "investigation", "incident-report", "runbook", "lessons-learned"]);
  if (!allowed.has(template)) {
    fail(`Unknown project page template: ${template}`);
  }
  return fs.readFileSync(path.join(root, "templates", "project-pages", `${template}.md`), "utf8").trim();
}

function structuredMarkdown({ title, description, date, status, slug, pageType, navigationTitle, navigationOrder, category, body }) {
  return [
    "---",
    `title: \"${escapeYamlString(title)}\"`,
    `description: \"${escapeYamlString(description)}\"`,
    `date: ${date}`,
    `status: ${status}`,
    "featured: false",
    "tags: []",
    `projectSlug: \"${escapeYamlString(slug)}\"`,
    `pageType: \"${pageType}\"`,
    `navigationTitle: \"${escapeYamlString(navigationTitle)}\"`,
    `navigationOrder: ${navigationOrder}`,
    `category: \"${escapeYamlString(category)}\"`,
    "---",
    "",
    body,
    ""
  ].join("\n");
}

function parseArgs(values) {
  const parsed = {};

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) {
      continue;
    }

    const key = value.slice(2);
    const next = values[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeYamlString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
