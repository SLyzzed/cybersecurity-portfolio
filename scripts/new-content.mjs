import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const type = process.argv[2];
const args = process.argv.slice(3);

const usage = [
  "Usage:",
  "  npm run new:project -- --title \"Home SIEM Lab\" --description \"Short summary\"",
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
const root = process.cwd();
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
