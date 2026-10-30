import { readdirSync } from "node:fs";

const skillScopes = readdirSync(new URL("./plugins/layer/skills", import.meta.url), {
  withFileTypes: true
})
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

export default {
  extends: ["@commitlint/config-conventional"],
  // Dependabot capitalizes "Bump" whenever a commit-message prefix is set, and offers no
  // option to change it, so its own commits are exempt from subject-case.
  ignores: [(message) => /^chore\((deps|ci)\): Bump /.test(message)],
  rules: {
    "scope-enum": [
      2,
      "always",
      [...skillScopes, "skills", "ci", "deps", "docs", "tooling", "evals"]
    ]
  }
};
