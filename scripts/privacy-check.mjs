import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const configPath = path.join(root, "privacy.config.json");
const defaultConfig = {
  configuredSensitiveStrings: [],
  scanPaths: [
    "src",
    "templates",
    "scripts",
    ".github",
    "README.md",
    "astro.config.mjs",
    "package.json"
  ],
  ignorePaths: [
    "node_modules",
    "dist",
    ".astro",
    ".git"
  ]
};
const localConfig = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
const config = {
  ...defaultConfig,
  ...localConfig,
  configuredSensitiveStrings: [
    ...defaultConfig.configuredSensitiveStrings,
    ...(localConfig.configuredSensitiveStrings ?? [])
  ],
  scanPaths: localConfig.scanPaths ?? defaultConfig.scanPaths,
  ignorePaths: localConfig.ignorePaths ?? defaultConfig.ignorePaths
};
const ignored = new Set(config.ignorePaths ?? []);
const findings = [];

const checks = [
  {
    name: "email address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
  },
  {
    name: "Windows user path",
    pattern: /[A-Z]:\\Users\\[^\\\s"'<>]+/g
  },
  {
    name: "secret assignment",
    pattern: /\b(?:api[_-]?key|token|secret|password|passwd|pwd|client[_-]?secret)\b\s*[:=]\s*["']?[A-Za-z0-9_\-./+=]{8,}/gi
  },
  {
    name: "private key block",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g
  },
  {
    name: "private hostname",
    pattern: /\b[a-z0-9-]+(?:\.local|\.lan|\.internal|\.corp|\.home)\b/gi
  },
  {
    name: "MAC address",
    pattern: /\b[0-9A-F]{2}(?::[0-9A-F]{2}){5}\b/gi
  },
  {
    name: "IPv4 private address",
    pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g
  }
];

for (const value of config.configuredSensitiveStrings ?? []) {
  if (typeof value === "string" && value.trim()) {
    checks.push({
      name: "configured sensitive string",
      pattern: new RegExp(escapeRegExp(value), "g")
    });
  }
}

for (const scanPath of config.scanPaths ?? []) {
  const absolutePath = path.join(root, scanPath);
  if (!fs.existsSync(absolutePath)) {
    continue;
  }

  scan(absolutePath);
}

if (findings.length > 0) {
  console.error("Privacy check failed:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.name}`);
  }
  process.exit(1);
}

console.log("Privacy check passed.");

function scan(target) {
  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
      if (ignored.has(entry.name)) {
        continue;
      }

      scan(path.join(target, entry.name));
    }
    return;
  }

  if (!stat.isFile() || isBinary(target)) {
    return;
  }

  const relative = path.relative(root, target);
  const content = fs.readFileSync(target, "utf8");

  for (const check of checks) {
    for (const match of content.matchAll(check.pattern)) {
      findings.push({
        file: relative,
        line: lineNumber(content, match.index ?? 0),
        name: check.name
      });
    }
  }
}

function isBinary(filePath) {
  return /\.(?:png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?)$/i.test(filePath);
}

function lineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
