#!/usr/bin/env node
// Verifies every Layer MCP tool a skill names actually exists, against the public
// manifest at https://layer.ai/.well-known/mcp.
//
// This is the repo's most important correctness gate. The file this repo replaced
// taught `get_model_recommendations`, a tool that has never existed, and nothing
// caught it. An agent following that instruction invents a call and fails.
//
// Needs network, so it is not part of `pnpm validate` (which the pre-commit hook
// runs offline). CI runs it on every pull request and on a schedule, because the
// manifest can change without this repository changing.
import { readFileSync } from "node:fs";
import { skillNames } from "./lib.mjs";

const MANIFEST = "https://layer.ai/.well-known/mcp";

// Tool names are verb-prefixed snake_case. These two tokens share that shape but are
// not tools: one is a parameter, one is a `filter.use_case` value. Keep this list
// minimal and justified; a growing list means the heuristic needs rethinking.
const NOT_TOOLS = new Set(["set_id", "split_into_layers"]);

const VERB_PREFIXED = new RegExp(
  "^(get|list|create|execute|estimate|start|cancel|render|upload|request|score|pack|" +
    "split|update|delete|add|remove|invite|suspend|reactivate|set)_[a-z0-9_]+$"
);

const response = await fetch(MANIFEST, { headers: { accept: "application/json" } });
if (!response.ok) {
  console.error(`ERROR could not fetch ${MANIFEST}: ${response.status} ${response.statusText}`);
  process.exit(1);
}
const manifest = await response.json();

const known = new Set();
for (const server of manifest.servers ?? []) {
  for (const tool of server.tools ?? []) {
    if (tool?.name) known.add(tool.name);
  }
}

if (known.size === 0) {
  console.error(`ERROR ${MANIFEST} returned no tools; refusing to pass vacuously`);
  process.exit(1);
}
console.log(`${known.size} tools published across ${manifest.servers.length} servers\n`);

let failed = false;
const used = new Set();

for (const name of skillNames()) {
  const path = `skills/${name}/SKILL.md`;
  const text = readFileSync(path, "utf8");
  const bad = [];

  for (const [, token] of text.matchAll(/`([a-z][a-z0-9_]*)`/g)) {
    if (NOT_TOOLS.has(token) || !VERB_PREFIXED.test(token)) continue;
    used.add(token);
    if (!known.has(token)) bad.push(token);
  }

  if (bad.length) {
    failed = true;
    for (const token of [...new Set(bad)].sort()) {
      console.error(`ERROR ${path}: \`${token}\` is not a published Layer MCP tool`);
    }
  } else {
    console.log(`OK ${path}`);
  }
}

// Not a failure: a tool nobody teaches is a gap worth seeing, not a defect.
const unused = [...known].filter((t) => !used.has(t)).sort();
if (unused.length) {
  console.log(`\nNOTICE ${unused.length} published tools are named by no skill:`);
  console.log(unused.map((t) => `  ${t}`).join("\n"));
}

process.exit(failed ? 1 : 0);
