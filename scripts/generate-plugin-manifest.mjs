#!/usr/bin/env node
// Generates the plugin manifests from skills.sh.json and VERSION.
// skills.sh.json is the source of truth, so these files are never edited by hand.
//
// The Claude Code marketplace picker groups by plugin entry and sorts group names
// alphabetically, so plugin names carry a two-digit position prefix to preserve the
// skills.sh.json order. Inserting a grouping renumbers the ones after it.
import { readFileSync, writeFileSync } from "node:fs";
import prettier from "prettier";
import { readGroupings, version } from "./lib.mjs";

const check = process.argv.includes("--check");
const v = version();
const config = readGroupings();

const slug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const marketplace = {
  name: "layer",
  owner: { name: "Layer", url: "https://layer.ai" },
  description: "Layer skills: creative craft for AI game and entertainment asset generation.",
  plugins: config.groupings.map((group, i) => ({
    name: `${String(i + 1).padStart(2, "0")}.-${slug(group.title)}`,
    source: "./",
    description: group.description,
    version: v,
    skills: group.skills.map((name) => `./skills/${name}`)
  }))
};

const allSkills = config.groupings.flatMap((g) => g.skills).map((n) => `./skills/${n}`);

const cursor = {
  name: "layer",
  displayName: "Layer",
  version: v,
  description:
    "Generate game and entertainment assets with Layer: images, video, 3D, and audio, with the craft knowledge to direct them.",
  author: { name: "Layer", url: "https://layer.ai" },
  homepage: "https://layer.ai",
  repository: "https://github.com/layerai/skills",
  license: "MIT",
  skills: allSkills,
  keywords: [
    "layer",
    "game-assets",
    "image-generation",
    "video-generation",
    "3d",
    "audio",
    "pixel-art",
    "sprites",
    "textures",
    "lora",
    "mcp"
  ]
};

const claudePlugin = {
  name: "layer",
  displayName: "Layer",
  version: v,
  description: cursor.description,
  author: cursor.author,
  homepage: "https://layer.ai",
  repository: cursor.repository,
  license: "MIT",
  skills: allSkills,
  mcpServers: "./.mcp.json",
  keywords: cursor.keywords
};

const codexPlugin = {
  name: "layer",
  displayName: "Layer",
  version: v,
  description: cursor.description,
  author: cursor.author,
  homepage: "https://layer.ai",
  repository: cursor.repository,
  license: "MIT",
  skills: allSkills,
  mcpServers: "./.mcp.json",
  keywords: cursor.keywords
};

const targets = [
  [".claude-plugin/marketplace.json", marketplace],
  [".claude-plugin/plugin.json", claudePlugin],
  [".cursor-plugin/plugin.json", cursor],
  [".codex-plugin/plugin.json", codexPlugin]
];

// Format through prettier with the repo config, so a generated manifest and a
// formatted one can never disagree and fail `yarn validate` against each other.
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
      console.error(`ERROR ${path} is out of date; run \`yarn manifest\``);
      failed = true;
    } else {
      console.log(`OK ${path}`);
    }
  } else {
    writeFileSync(path, next);
    console.log(`wrote ${path}`);
  }
}

process.exit(failed ? 1 : 0);
