#!/usr/bin/env node
// Prints the clean-room prompt for the application test in AGENTS.md.
//
// Usage: node scripts/application-test.mjs <skill-name> "<realistic task>"
//
// Paste the output into a fresh agent with no repository context and no history.
// It must return a numbered tool-call plan without executing anything. Grade that
// plan against https://layer.ai/docs/mcp/tools and https://layer.ai/.well-known/mcp,
// fetched fresh. The failure list is in AGENTS.md, "Application test protocol".
import { readFileSync } from "node:fs";
import { skillNames } from "./lib.mjs";

const [name, task] = process.argv.slice(2);

if (!name || !task) {
  console.error('Usage: node scripts/application-test.mjs <skill-name> "<realistic task>"');
  console.error(`Skills: ${skillNames().join(", ")}`);
  process.exit(1);
}
if (!skillNames().includes(name)) {
  console.error(`ERROR unknown skill "${name}"`);
  process.exit(1);
}

const read = (n) => readFileSync(`skills/${n}/SKILL.md`, "utf8");

// Real installs ship the core skill alongside every other one, so the test does too.
const installed = name === "layer" ? [name] : ["layer", name];

console.log(`You are an agent connected to the Layer MCP server at https://mcp.app.layer.ai/mcp.
The skill document(s) below are installed and available to you.

Produce a numbered tool-call plan for the task: exact tool names, and the argument shape
for each call. Do NOT execute any tool, do not browse, and do not consult anything beyond
the documents provided here. Where you are uncertain, say so explicitly rather than
guessing a tool name, a parameter, or a value.

--- TASK ---
${task}

${installed.map((n) => `--- SKILL: ${n} ---\n${read(n)}`).join("\n\n")}`);
