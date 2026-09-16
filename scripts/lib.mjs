import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const SKILLS_DIR = "skills";

export function skillNames() {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/** Parse the frontmatter of a SKILL.md. Values are flat scalars by contract. */
export function readSkill(name) {
  const path = join(SKILLS_DIR, name, "SKILL.md");
  const text = readFileSync(path, "utf8");
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`${path}: missing YAML frontmatter`);

  const frontmatter = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) throw new Error(`${path}: invalid frontmatter line: ${line}`);
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return { path, frontmatter, body: match[2] };
}

/**
 * Word count of the body, matching the documented measurement in AGENTS.md:
 *   awk '/^---$/{c++; next} c>=2' SKILL.md | wc -w
 */
export function bodyWordCount(body) {
  return body.split(/\s+/).filter(Boolean).length;
}

export function readGroupings() {
  return JSON.parse(readFileSync("skills.sh.json", "utf8"));
}

export function version() {
  return readFileSync("VERSION", "utf8").trim();
}
