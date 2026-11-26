import { spawn, spawnSync } from "node:child_process";
import process from "node:process";

const options = parseArgs(process.argv.slice(2));
const host = options.host ?? "127.0.0.1";
const port = options.port ?? "4321";
const skipBuild = Boolean(options.skipBuild);
const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";

if (options.help) {
  console.log([
    "Usage:",
    "  npm run test:site",
    "  npm run test:site -- --port 4322",
    "  npm run test:site -- --host 0.0.0.0 --port 4321",
    "  npm run test:site -- --skip-build",
    "",
    "Starts a local testing server from the production Astro output."
  ].join("\n"));
  process.exit(0);
}

if (!skipBuild) {
  run("Building production site", npmExecutable, ["run", "build"]);
  run("Checking internal links", npmExecutable, ["run", "check:links"]);
}

console.log("");
console.log("Starting static test server.");
console.log(`Local URL: http://${host}:${port}/cybersecurity-portfolio/`);
console.log("Press Ctrl+C to stop.");
console.log("");

const server = spawn(
  process.execPath,
  ["scripts/site/astro-cli.mjs", "preview", "--host", host, "--port", port],
  {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      NODE_ENV: "test"
    }
  }
);

server.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

function run(label, command, args) {
  console.log("");
  console.log(label);

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      NODE_ENV: "test"
    }
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
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
      parsed[toCamelCase(key)] = true;
      continue;
    }

    parsed[toCamelCase(key)] = next;
    index += 1;
  }

  return parsed;
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
