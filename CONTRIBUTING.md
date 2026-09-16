# Contributing

Thanks for helping improve the Layer Agent Skills. This guide covers the mechanics of a contribution;
[AGENTS.md](AGENTS.md) is the full authoring contract and wins wherever the two overlap.

## Before you start

- Found a bug or unclear guidance? Open an issue first.
- This repository is public. Everything in it, commit messages, PR text, and issue text included,
  must be publicly shareable: no internal hostnames, no credentials or signed asset URLs, no
  workspace or project ids, and no claim that cannot be verified from a public surface such as the
  [tool reference](https://layer.ai/docs/mcp/tools) or the
  [MCP manifest](https://layer.ai/.well-known/mcp). When in doubt, leave it out.
- Anything tied to your account (billing, Creative Units, a security report) goes to Layer's in-app
  support, never into a public issue. See [SECURITY.md](SECURITY.md).

## Setup

```bash
git clone https://github.com/layerai/skills.git
cd skills
pnpm install
```

`pnpm install` sets up prettier, cspell, commitlint, and the husky hooks, so every commit runs the
checks CI runs.

## Authoring a skill

Read [AGENTS.md](AGENTS.md) before writing. It defines the frontmatter contract, the "Use when"
description format, the 1000-word body target, the ban on hard-coded `base_model_id` values, the
20 CU spend gate, and the house style (no em dashes, no marketing language).

The most important rule is the one people break first: **every tool name, parameter, and limit must
be verifiable from a public surface.** Anything else is a guess, even when it happens to be right.

## Validating

```bash
pnpm format   # prettier reflows prose, so run it before validate
pnpm validate # style, formatting, supporting files, groupings, manifests, README, spelling, spec
```

`skills.sh.json` is the source of truth for grouping. The plugin manifests and the README skills
table are generated from it, so never edit those by hand; `pnpm manifest` and `pnpm readme:fix`
regenerate them, and the pre-commit hook does it for you.

A new or changed skill also needs the application test from
[AGENTS.md](AGENTS.md#application-test-protocol): a clean-room agent runs a realistic task with only
the skill installed, and its plan is graded against the public tool reference. Mechanical validation
checks the format. The application test checks whether the skill actually teaches.

## Commits and pull requests

- [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint. Valid scopes
  are the skill directory names plus `skills`, `ci`, `deps`, `docs`, `tooling`, and `evals`.
- PRs target `main` and are squash-merged, so the PR title becomes the commit header.
- Keep a PR to one concern. A new skill, a fix to another skill, and a tooling change are three PRs.

## AI-agent contributors

Agents are first-class authors here ([AGENTS.md](AGENTS.md) is written for them), with one
expectation: a human reviews the complete diff before the PR is submitted, and the PR says so.

## License

Contributions are licensed under the [MIT License](LICENSE), the same license every skill carries in
its frontmatter.
