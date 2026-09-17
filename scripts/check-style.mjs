#!/usr/bin/env node
// House style, the frontmatter contract, and the body word budget.
// The budget rationale lives in AGENTS.md; do not change these numbers without it.
import { skillNames, readSkill, bodyWordCount } from "./lib.mjs";

const WORD_TARGET = 1000;
const WORD_CAP = 2500;
const DESCRIPTION_CAP = 500;
const ALLOWED_KEYS = new Set(["name", "description", "license"]);

let failed = false;
const fail = (msg) => {
  console.error(`ERROR ${msg}`);
  failed = true;
};
const notice = (msg) => console.log(`NOTICE ${msg}`);

const counts = [];

for (const name of skillNames()) {
  const { path, frontmatter, body } = readSkill(name);

  for (const key of Object.keys(frontmatter)) {
    if (!ALLOWED_KEYS.has(key)) fail(`${path}: unexpected frontmatter key "${key}"`);
  }
  for (const key of ALLOWED_KEYS) {
    if (!frontmatter[key]) fail(`${path}: missing frontmatter key "${key}"`);
  }

  if (frontmatter.name !== name) {
    fail(`${path}: name "${frontmatter.name}" does not equal directory name "${name}"`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    fail(`${path}: invalid skill name "${name}"`);
  }
  if (frontmatter.license !== "MIT") {
    fail(`${path}: license must be MIT, got "${frontmatter.license}"`);
  }

  const description = frontmatter.description ?? "";
  if (description.length > DESCRIPTION_CAP) {
    fail(`${path}: description is ${description.length} chars, cap is ${DESCRIPTION_CAP}`);
  }
  if (!/^Use when\b/.test(description)) {
    fail(`${path}: description must start with "Use when"`);
  }

  // Em dashes are banned repo-wide in skill prose. See AGENTS.md, Style.
  if (body.includes("—") || description.includes("—")) {
    fail(`${path}: contains an em dash; use a comma, a colon, parentheses, or two sentences`);
  }

  const words = bodyWordCount(body);
  counts.push({ name, words });
  if (words > WORD_CAP) {
    fail(`${path}: body is ${words} words, cap is ${WORD_CAP}`);
  } else if (words > WORD_TARGET) {
    notice(`${path}: body is ${words} words, over the ${WORD_TARGET}-word target`);
  }

  console.log(`OK ${path} (${words} words)`);
}

// The shared post-compaction re-attach pool is what the mean protects, not the cap.
// See AGENTS.md, Body.
if (counts.length) {
  const mean = Math.round(counts.reduce((a, c) => a + c.words, 0) / counts.length);
  console.log(`\n${counts.length} skills, mean body ${mean} words`);
  if (mean > WORD_TARGET) notice(`mean body length ${mean} exceeds the ${WORD_TARGET}-word target`);
}

process.exit(failed ? 1 : 0);
