#!/usr/bin/env node
// Checks plugin.json against what the OpenAI and Claude plugin directories require,
// so a listing problem fails here rather than in a portal review.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PLUGIN_DIR, SKILLS_DIR, readPlugin, readSkill, skillNames } from "./lib.mjs";

const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const HTTPS_URL = /^https:\/\/\S+$/;
const OPENAI_CATEGORIES = new Set([
  "Productivity",
  "Creativity",
  "Developer Tools",
  "Business & Operations",
  "Data & Analytics",
  "Communication",
  "Education & Research",
  "Security",
  "Finance",
  "Healthcare",
  "Travel",
  "Entertainment",
  "Other"
]);
const OPENAI_URL_FIELDS = ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"];
const OPENAI_SINGLE_LINE_FIELDS = [
  ["displayName", 30],
  ["shortDescription", 30],
  ["developerName", 80]
];

const isText = (value, max) =>
  typeof value === "string" && value.trim() !== "" && value.length <= max;
const isLine = (value, max) => isText(value, max) && !value.includes("\n");
const isPluginPath = (value, fileExists) =>
  value.startsWith("./") && !value.includes("..") && fileExists(value);

function checkPlugin({ manifest, skills, fileExists }) {
  const errors = [];
  const { name, version, description } = manifest;

  if (!NAME.test(name ?? ""))
    errors.push(`name "${name}" must be lowercase kebab-case (a-z, 0-9, single hyphens)`);
  if (!SEMVER.test(version ?? ""))
    errors.push(`version "${version}" must be semver (OpenAI requires it for every submission)`);
  if (!isText(description, 1024)) errors.push("description must be 1-1024 characters");

  const openai = manifest.extensions?.["com.openai"] ?? {};
  const ui = openai.interface ?? {};
  for (const [field, max] of OPENAI_SINGLE_LINE_FIELDS) {
    if (!isLine(ui[field], max))
      errors.push(`com.openai.interface.${field} must be one line of 1-${max} characters`);
  }
  if (!isText(ui.longDescription, 4000))
    errors.push("com.openai.interface.longDescription must be 1-4000 characters");
  if (ui.category !== undefined && !OPENAI_CATEGORIES.has(ui.category)) {
    errors.push(`com.openai.interface.category "${ui.category}" is not an OpenAI category`);
  }
  for (const field of OPENAI_URL_FIELDS) {
    if (!(HTTPS_URL.test(ui[field] ?? "") && ui[field].length <= 1024)) {
      errors.push(`com.openai.interface.${field} must be an https URL of at most 1024 characters`);
    }
  }
  const prompts = [ui.defaultPrompt ?? []].flat();
  if (prompts.length > 3 || !prompts.every((prompt) => isLine(prompt, 128))) {
    errors.push(
      "com.openai.interface.defaultPrompt allows at most 3 prompts, each one line of 1-128 characters"
    );
  }
  for (const field of ["logo", "composerIcon"]) {
    if (ui[field] === undefined)
      errors.push(`com.openai.interface.${field} is required for OpenAI submission`);
  }
  for (const key of ["apps", "hooks"]) {
    if (key in openai) errors.push(`com.openai.${key} makes the package unsubmittable to OpenAI`);
  }

  const pluginPaths = [
    ["com.openai.interface.logo", ui.logo],
    ["com.openai.interface.composerIcon", ui.composerIcon],
    ["com.openai.onboardingSkill", openai.onboardingSkill],
    ["com.anthropic.icon", manifest.extensions?.["com.anthropic"]?.icon]
  ];
  for (const [label, value] of pluginPaths) {
    if (value !== undefined && !isPluginPath(value, fileExists)) {
      errors.push(`${label} "${value}" must be a ./ path to an existing file inside the plugin`);
    }
  }

  const testCases = openai.review?.test_cases;
  if (testCases) {
    if (testCases.positive?.length !== 5 || testCases.negative?.length !== 3) {
      errors.push("com.openai.review.test_cases needs exactly 5 positive and 3 negative cases");
    }
    for (const c of testCases.positive ?? []) {
      if (!(c.description && c.prompt && c.tools_triggered && c.expected_behavior)) {
        errors.push(
          `positive test case "${c.description}" needs description, prompt, tools_triggered and expected_behavior`
        );
      }
    }
    for (const c of testCases.negative ?? []) {
      if (!(c.description && c.prompt))
        errors.push(`negative test case "${c.description}" needs description and prompt`);
    }
  }

  for (const skill of skills) {
    const where = `${SKILLS_DIR}/${skill.dir}`;
    if (`${name}:${skill.name}`.length > 64)
      errors.push(`${where}: "${name}:${skill.name}" exceeds 64 characters`);
    if (!isText(skill.description, 1024))
      errors.push(`${where}: description must be 1-1024 characters`);
    if (/\bClaude\b/.test(`${skill.description}\n${skill.body}`)) {
      errors.push(
        `${where}: mentions "Claude"; skills also ship to OpenAI, so use neutral wording`
      );
    }
  }

  return errors;
}

const skills = skillNames().map((dir) => {
  const { frontmatter, body } = readSkill(dir);
  return { dir, name: frontmatter.name, description: frontmatter.description, body };
});
const errors = checkPlugin({
  manifest: readPlugin(),
  skills,
  fileExists: (path) => existsSync(join(PLUGIN_DIR, path))
});
for (const error of errors) console.error(`ERROR ${PLUGIN_DIR}/plugin.json: ${error}`);
if (errors.length === 0) console.log(`OK ${PLUGIN_DIR}/plugin.json`);
process.exit(errors.length > 0 ? 1 : 0);
