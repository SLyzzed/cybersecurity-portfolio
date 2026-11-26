import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dist = path.join(root, "dist");
const base = "/cybersecurity-portfolio";
const failures = [];

if (!fs.existsSync(dist)) {
  console.error("dist directory does not exist. Run npm run build first.");
  process.exit(1);
}

for (const filePath of walk(dist)) {
  if (!filePath.endsWith(".html")) {
    continue;
  }

  const html = fs.readFileSync(filePath, "utf8");
  const links = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  for (const link of links) {
    if (isExternal(link) || link.startsWith("#") || link.startsWith("mailto:") || link.startsWith("tel:")) {
      continue;
    }

    const normalized = normalizeInternalLink(link);
    if (!normalized) {
      continue;
    }

    if (!fs.existsSync(path.join(dist, normalized))) {
      failures.push(`${path.relative(root, filePath)} -> ${link}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Broken internal links found:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Internal link check passed.");

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(entryPath);
    } else {
      yield entryPath;
    }
  }
}

function isExternal(link) {
  return /^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith("//");
}

function normalizeInternalLink(link) {
  const withoutHash = link.split("#")[0].split("?")[0];
  if (!withoutHash) {
    return null;
  }

  let pathname = withoutHash;
  if (pathname.startsWith(base)) {
    pathname = pathname.slice(base.length) || "/";
  }

  if (pathname.startsWith("/")) {
    pathname = pathname.slice(1);
  }

  if (!pathname || pathname.endsWith("/")) {
    pathname = `${pathname}index.html`;
  }

  return pathname;
}
