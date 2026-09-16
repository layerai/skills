#!/usr/bin/env node
// The README skills section is generated from skills.sh.json so the two cannot drift:
// one subsection per grouping, in order, with one row per skill carrying its live
// description. Run with --fix to rewrite it.
import { readFileSync, writeFileSync } from "node:fs";
import prettier from "prettier";
import { readGroupings, readSkill } from "./lib.mjs";

const START = "<!-- skills:start -->";
const END = "<!-- skills:end -->";
const fix = process.argv.includes("--fix");

const config = readGroupings();

const render = () => {
  const out = [];
  for (const group of config.groupings) {
    out.push(`### ${group.title}`, "", group.description, "");
    out.push("| Skill | Use when |", "| --- | --- |");
    for (const name of group.skills) {
      const { frontmatter } = readSkill(name);
      const description = frontmatter.description.replace(/\|/g, "\\|");
      out.push(`| [\`${name}\`](skills/${name}/SKILL.md) | ${description} |`);
    }
    out.push("");
  }
  return out.join("\n").trimEnd();
};

const readme = readFileSync("README.md", "utf8");
const startIdx = readme.indexOf(START);
const endIdx = readme.indexOf(END);

if (startIdx === -1 || endIdx === -1) {
  console.error(`ERROR README.md: missing ${START} / ${END} markers`);
  process.exit(1);
}

const before = readme.slice(0, startIdx + START.length);
const after = readme.slice(endIdx);

// Format through prettier with the repo config: it rewrites markdown tables, so an
// unformatted generated section would fail `format:check` right after being written.
const next = await prettier.format(`${before}\n\n${render()}\n\n${after}`, {
  ...(await prettier.resolveConfig("README.md")),
  filepath: "README.md"
});

if (next === readme) {
  console.log("OK README.md skills section matches skills.sh.json");
  process.exit(0);
}

if (fix) {
  writeFileSync("README.md", next);
  console.log("wrote README.md skills section");
  process.exit(0);
}

console.error("ERROR README.md skills section is out of date; run `yarn readme:fix`");
process.exit(1);
