#!/usr/bin/env node
// Writes dist/layer-<version>.zip, the package uploaded to the OpenAI plugin portal.
// The repository root is the plugin, so the ZIP takes an allowlist rather than the
// whole tree, and PLUGIN.md ships as its README: the repository README is for
// people installing skills, not for directory reviewers.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { readPlugin, version } from "./lib.mjs";

const ENTRIES = ["plugin.json", "mcp.json", "skills", "assets"];

const { name } = readPlugin();
const stage = join("dist", name);
const zip = `${name}-${version()}.zip`;

rmSync(stage, { recursive: true, force: true });
rmSync(join("dist", zip), { force: true });
mkdirSync(stage, { recursive: true });
for (const entry of ENTRIES) cpSync(entry, join(stage, entry), { recursive: true });
cpSync("PLUGIN.md", join(stage, "README.md"));

execFileSync("zip", ["-qrX", join("..", zip), ".", "-x", "*.DS_Store"], {
  cwd: stage,
  stdio: "inherit"
});
console.log(`packaged dist/${zip}`);
