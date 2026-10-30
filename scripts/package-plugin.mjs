#!/usr/bin/env node
// Writes dist/layer-<version>.zip, the package uploaded to the OpenAI plugin portal.
// The plugin folder is exactly what ships, so the ZIP is its contents.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { PLUGIN_DIR, readPlugin, version } from "./lib.mjs";

const { name } = readPlugin();
const zip = resolve("dist", `${name}-${version()}.zip`);

mkdirSync("dist", { recursive: true });
rmSync(zip, { force: true });
execFileSync("zip", ["-qrX", zip, ".", "-x", "*.DS_Store"], {
  cwd: PLUGIN_DIR,
  stdio: "inherit"
});
console.log(`packaged dist/${name}-${version()}.zip`);
