#!/usr/bin/env node
// VERSION is the single source of truth. Every manifest that declares a version
// must agree with it, so a release can never half-land.
import { readFileSync } from "node:fs";
import { version } from "./lib.mjs";

const v = version();
let failed = false;

if (!/^\d+\.\d+\.\d+$/.test(v)) {
  console.error(`ERROR VERSION is not semver: ${v}`);
  process.exit(1);
}

const sites = [
  [".claude-plugin/plugin.json", (j) => j.version],
  [".claude-plugin/marketplace.json", (j) => j.plugins.map((p) => p.version)],
  [".cursor-plugin/plugin.json", (j) => j.version],
  [".codex-plugin/plugin.json", (j) => j.version]
];

for (const [path, pick] of sites) {
  const picked = pick(JSON.parse(readFileSync(path, "utf8")));
  for (const actual of [picked].flat()) {
    if (actual !== v) {
      console.error(`ERROR version drift in ${path}: expected ${v}, got ${actual}`);
      failed = true;
    }
  }
  if (!failed) console.log(`OK ${path} = ${v}`);
}

process.exit(failed ? 1 : 0);
