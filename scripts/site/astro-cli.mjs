import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const command = process.argv[2] ?? "help";
const args = process.argv.slice(3);
const executable = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "astro.cmd" : "astro"
);

const result = spawnSync(executable, [command, ...args], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    ASTRO_TELEMETRY_DISABLED: "1"
  }
});

process.exit(result.status ?? 1);
