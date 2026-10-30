#!/usr/bin/env node
// Generates the plugin manifests from plugin.json, mcp.json, skills.sh.json, and VERSION.
// plugin.json holds the plugin's identity and directory listings, mcp.json the MCP
// servers, skills.sh.json the skill order, VERSION the version. The generated files are
// never edited by hand, and plugin.json's own `version` is rewritten from VERSION.
//
// Every client gets the same single plugin from PLUGIN_DIR. The root marketplaces only
// point at it, so an install copies that folder and nothing else from the repository.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import prettier from "prettier";
import { PLUGIN_DIR, readGroupings, readJson, readPlugin, version } from "./lib.mjs";

const check = process.argv.includes("--check");
const v = version();
const config = readGroupings();
const plugin = { ...readPlugin(), version: v };

const source = `./${PLUGIN_DIR}`;
const owner = { name: "Layer", url: "https://layer.ai" };
const marketplaceDescription =
  "Layer skills: creative craft for AI game and entertainment asset generation.";

const marketplace = {
  name: "layer",
  owner,
  description: marketplaceDescription,
  plugins: [{ name: plugin.name, source, description: plugin.description, version: v }]
};

const cursorMarketplace = {
  name: "layer",
  owner,
  metadata: { description: marketplaceDescription },
  plugins: [{ name: plugin.name, source, description: plugin.description }]
};

// Codex and ChatGPT read the plugin's plugin.json and mcp.json; this marketplace lists them.
const openaiMarketplace = {
  name: "layer",
  interface: { displayName: "Layer" },
  plugins: [
    {
      name: plugin.name,
      source: { source: "local", path: source },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: plugin.extensions["com.openai"].interface.category
    }
  ]
};

// Claude names the Agent Plugins `streamable-http` transport `http`, and drops a
// remote server that has no type.
const CLAUDE_SERVER_TYPES = { "streamable-http": "http", sse: "sse" };
const claudeMcp = {
  mcpServers: Object.fromEntries(
    Object.entries(readJson(join(PLUGIN_DIR, "mcp.json")).mcpServers).map(([name, server]) => {
      const type = CLAUDE_SERVER_TYPES[server.type];
      if (!type)
        throw new Error(`mcp.json: server "${name}" has no Claude type for "${server.type}"`);
      return [name, { ...server, type }];
    })
  )
};

const allSkills = config.groupings.flatMap((g) => g.skills).map((n) => `./skills/${n}`);

const cursor = {
  name: plugin.name,
  displayName: "Layer",
  version: v,
  description: plugin.description,
  author: plugin.author,
  homepage: plugin.homepage,
  repository: plugin.repository,
  license: plugin.license,
  skills: allSkills,
  keywords: plugin.keywords
};

const claudePlugin = {
  ...cursor,
  mcpServers: "./.mcp.json",
  ...plugin.extensions["com.anthropic"]
};

const inPlugin = (path) => join(PLUGIN_DIR, path);
const targets = [
  [inPlugin("plugin.json"), plugin],
  [inPlugin(".claude-plugin/plugin.json"), claudePlugin],
  [inPlugin(".cursor-plugin/plugin.json"), cursor],
  [inPlugin(".mcp.json"), claudeMcp],
  [".claude-plugin/marketplace.json", marketplace],
  [".cursor-plugin/marketplace.json", cursorMarketplace],
  [".agents/plugins/marketplace.json", openaiMarketplace]
];

// Format through prettier with the repo config, so a generated manifest and a
// formatted one can never disagree and fail `pnpm validate` against each other.
const format = async (value, path) =>
  prettier.format(JSON.stringify(value), {
    ...(await prettier.resolveConfig(path)),
    filepath: path
  });

let failed = false;
for (const [path, value] of targets) {
  const next = await format(value, path);
  if (check) {
    let current = null;
    try {
      current = readFileSync(path, "utf8");
    } catch {
      /* missing counts as drift */
    }
    if (current !== next) {
      console.error(`ERROR ${path} is out of date; run \`pnpm manifest\``);
      failed = true;
    } else {
      console.log(`OK ${path}`);
    }
  } else {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, next);
    console.log(`wrote ${path}`);
  }
}

process.exit(failed ? 1 : 0);
