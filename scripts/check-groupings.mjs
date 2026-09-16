#!/usr/bin/env node
// skills.sh.json is the single source of truth for how skills are grouped.
// Every skill must appear in exactly one grouping, and every listed skill must exist.
import { skillNames, readGroupings } from "./lib.mjs";

let failed = false;
const fail = (msg) => {
  console.error(`ERROR ${msg}`);
  failed = true;
};

const config = readGroupings();
const onDisk = new Set(skillNames());
const seen = new Map();

if (!Array.isArray(config.groupings) || config.groupings.length === 0) {
  fail("skills.sh.json: groupings must be a non-empty array");
}

for (const group of config.groupings ?? []) {
  if (!group.title) fail("skills.sh.json: a grouping is missing a title");
  if (!group.description)
    fail(`skills.sh.json: grouping "${group.title}" is missing a description`);
  if (!Array.isArray(group.skills) || group.skills.length === 0) {
    fail(`skills.sh.json: grouping "${group.title}" lists no skills`);
  }
  for (const name of group.skills ?? []) {
    if (!onDisk.has(name))
      fail(`skills.sh.json: grouping "${group.title}" lists unknown skill "${name}"`);
    if (seen.has(name))
      fail(`skills.sh.json: "${name}" appears in both "${seen.get(name)}" and "${group.title}"`);
    seen.set(name, group.title);
  }
}

for (const name of onDisk) {
  if (!seen.has(name)) fail(`skills/${name} is in no skills.sh.json grouping`);
}

if (!failed) console.log(`OK ${onDisk.size} skills across ${config.groupings.length} groupings`);
process.exit(failed ? 1 : 0);
