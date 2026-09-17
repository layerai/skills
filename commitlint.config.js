import { readdirSync } from "node:fs";

const skillScopes = readdirSync(new URL("./skills", import.meta.url), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [...skillScopes, "skills", "ci", "deps", "docs", "tooling", "evals"]
    ]
  }
};
