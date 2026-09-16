# AGENTS.md

Guidance for AI agents (and humans) authoring in this repository.

## What this repo is

Public Agent Skills for [Layer](https://layer.ai) that teach **creative craft**: how to direct a
generation so the asset that comes back is usable. Sprites that read at 32px, textures that tile
without a seam, a cast that holds its design across twelve images, a storyboard with one beat per
panel. The skills drive the [Layer MCP server](https://layer.ai/docs/mcp) and follow the
[Agent Skills](https://agentskills.io) format.

## The division of labour

Layer already publishes six skills at
[`layer.ai/.well-known/agent-skills/`](https://layer.ai/.well-known/agent-skills/index.json), served
from the product and discoverable by any agent. They teach **platform mechanics**, REST first and
MCP second: `layer-api-authentication`, `layer-connect-mcp`, `layer-generate-assets`,
`layer-run-workflows`, `layer-train-custom-style`, `layer-manage-workspace`.

This repository does not duplicate them. It is the **craft layer above** them.

| Question                                                          | Whose skill answers it        |
| ----------------------------------------------------------------- | ----------------------------- |
| How do I authenticate, connect a client, call the API?            | The published platform skills |
| What is the request shape, what does polling look like?           | The published platform skills |
| Which model, which filters, which parameters for _this_ task?     | Here                          |
| What must the prompt name so the output is actually usable?       | Here                          |
| How do I hold a character consistent, tile a texture, pace a cut? | Here                          |

When a skill here needs a mechanic, it cross-references the published skill by name rather than
restating it. Restating it means two copies that drift, and the mechanics copy we do not own is the
one that stays right.

## Layout

```
skills/<name>/SKILL.md       # name must equal the directory name
skills/<name>/references/    # only when linked from SKILL.md
tests/<name>/                # tests for any script shipped with skill <name>
```

Supporting files sit next to a SKILL.md only when the content is too large to inline, and must be
linked directly from SKILL.md: agents resolve file references one level deep, so a reference chained
through another supporting file may never be read. A skill's own `README.md` is the one exemption
(`task skill-files` skips it): it documents the skill for maintainers, not for the agent running it,
and linking it would spend body words inviting a runtime agent to read maintainer notes as
instructions.

Scripts shipped with a skill are tested in `tests/<name>/` at the repo root, never inside the skill
directory: a published skill carries only what a runtime agent needs.

## Public content only

This repository is public. Everything in it, commit messages and PR text included, must be publicly
shareable: no internal hostnames, no workspace or project ids, no signed asset URLs, no credentials,
and no claim that cannot be verified from a public surface. Nothing from Layer's own product
repositories is copied here verbatim; knowledge is re-expressed against the public tool surface.

## Authoring rules

### Frontmatter

- `name`, `description`, `license: MIT`. Nothing else. No `version:` key: the repo has one `VERSION`
  and a per-skill copy is four more places to drift with no runtime benefit.
- `name`: lowercase letters, numbers and hyphens, equal to the directory name.

### Description

Third person, starts with "Use when", describes **triggering conditions only**, never a summary of
the workflow. Under 500 characters. Rich in the words a user actually types: sprite, tileset,
turnaround, seamless, LoRA, storyboard, moodboard, walk cycle. Only `name` and `description` load at
agent startup, so the description is the entire triggering surface; the body is dead weight if the
description never fires.

### Body

- 1000 words is the house target. The build fails past 2500 (`task style`).
- Measure the exact number `task style` checks (`task words` prints it per skill):
  `awk '/^---$/{c++; next} c>=2' skills/<name>/SKILL.md | wc -w`
- Structure: Overview, Quick reference, one excellent worked example, Common mistakes.
- Why a budget at all: the body enters context only when the skill triggers, and then every word
  competes with the user's task. Claude Code's post-compaction re-attach keeps the first 5000 tokens
  of each invoked skill from a 25,000-token pool shared across all of them, filled most-recent-first,
  so an oversized body both truncates itself and starves its siblings. At this repo's density
  (roughly 1.75 tokens per word) 2500 words is near 4400 tokens: inside the ceiling, with margin.
  The cap is the guardrail; the target is the craft.
- Trim before you split. The body loads on every trigger; a linked reference loads only when the
  agent follows the link. Facts every run needs stay in the body. A reference the agent must always
  read is a longer body in disguise.
- Spend words on facts an agent would otherwise guess wrong, not on prose an agent could infer.

### Ground every claim

Every tool name, parameter, and limit must be verifiable from a public surface:

- [Tool reference](https://layer.ai/docs/mcp/tools) — the creative server's documented tools
- [MCP manifest](https://layer.ai/.well-known/mcp) — both servers, every tool, machine-readable
- [Setup](https://layer.ai/docs/mcp/setup) — endpoints, transport, auth
- `get_instructions`, `get_forge_instructions`, `get_workflow_instructions` — the server's own
  guidance, which is what a connected agent actually receives

Anything asserted that appears in none of these is a guess, even when it happens to be right.

### Never hard-code a model id

Layer's catalogue is workspace-gated and it churns. A `base_model_id` named today is renamed,
superseded, or simply not enabled for the reader's workspace within a quarter, and the failure mode
is `MODEL_NOT_FOUND`. Discover instead: `list_base_models` with a `filter.use_case` plus any required
`filter.capabilities`, and take the first result, because the default `sort` is Layer's curated
recommendation order. Then `get_base_model` for the per-model contract, since some models require a
trigger word in the prompt.

A filter that returns nothing is too narrow. Loosen it. Never invent a model to fill the gap.

The exception is Layer's own deterministic utilities, which are tools rather than models and have no
competing alternative: `pack_sprite_sheet`, `split_sprite_sheet`, `render_video_timeline`. Name those
outright, and say in the body why the name is fixed, so the next author does not read it as an
oversight.

Model **family** names in prose ("Kling and Minimax disagree about camera direction") are fine and
often necessary. An id passed to `execute_forge` is not.

### Estimate before execute, always

`estimate_forge_price` and `estimate_workflow_price` cost nothing and return the price and the
resulting balance together, so a separate `get_workspace` call is unnecessary. Above **20 CUs** the
agent asks the user and waits for an explicit yes. The server states that threshold and states that
it is not negotiable, so no skill here may raise it, and none may let a user raise it for a session.

`allow_negative_balance` exists on some workspaces. It means the run will not be blocked. It does not
mean the run is free, and a skill must never present it as headroom.

### Poll at the returned interval

`execute_forge` and `execute_workflow` return `poll_interval_seconds`, typically 10. Poll at that
value. Never a fixed sleep, never a tighter loop.

### Uploads

`request_file_upload_url` for local bytes (signed URL, two-step resumable). `upload_file` only when
the file is already at a public http(s) URL. Upload before generating. `file_id` values are reusable
across runs, and an output asset from a completed run carries a `file_id` that feeds the next run
directly, so re-uploading a generated asset is always a mistake.

### Report degradation

`estimate_forge_price`, `execute_forge` and `get_forge_run` all return `reference_set_contributions`,
`reference_sets_degraded` and `reference_sets_warning`. Degradation is quiet: the run still succeeds
and still costs Creative Units. When a set did not apply, say which and why. Never report a degraded
set as applied.

### MCP is the surface

Every step a skill has an agent perform goes through an MCP tool. Do not route the agent to the REST
API or a CLI where an MCP tool exists; the published `layer-generate-assets` skill covers the REST
path for readers who want it. A capability MCP does not expose is a gap worth reporting, not
something to bridge with a raw HTTP call. Fetching a URL an MCP tool already returned is not an API
call and stays fine.

Scripts under `skills/<name>/scripts/` are the exception and may use whatever tool fits, as long as
the body says what the script does and who runs it, so no agent reads it as the workflow.

### Sibling skills

A skill that names a sibling also carries the install invitation, byte-identical across skills (copy
it from any SKILL.md). Neither the Agent Skills spec nor the skills CLI resolves dependencies, so
that sentence is the entire mechanism.

### Style

No em dashes, ever: use a comma, a colon, parentheses, or two sentences. No marketing language. No
assuming a specific agent outside clearly labelled setup snippets. Say it once, then stop: no
preamble, no restating the question, no summary of what you just wrote. Noise is paid on every future
read.

Layer's brand guidelines govern our web surfaces. They do not govern skill markdown, which is prose
for a machine.

## Tooling

One-time setup: `task install`. It needs [Task](https://taskfile.dev) and, for spec validation,
[uv](https://docs.astral.sh/uv/), and it installs prettier, cspell, commitlint, and the husky hooks.

Commands live in the `Taskfile.yaml`, not in workflow YAML: CI is setup plus one task call per job,
so the same command runs locally and in CI. `task --list` shows them all. The pnpm scripts in
`package.json` are the thin layer underneath; a task calls a script, never the other way round.

`task check` is the gate, run identically by the pre-commit hook and by the Validate workflow:

| Task                 | Checks                                                                      |
| -------------------- | --------------------------------------------------------------------------- |
| `task style`         | Body word budget, em dashes, frontmatter contract, house style              |
| `task format:check`  | prettier                                                                    |
| `task skill-files`   | Supporting files are linked from SKILL.md and parse; `README.md` exempt     |
| `task groupings`     | Every skill is in a `skills.sh.json` grouping and every listed skill exists |
| `task version:check` | `VERSION` agrees with every plugin manifest that declares one               |
| `task spell`         | cspell                                                                      |
| `task spec`          | `skills-ref validate` on every skill                                        |
| `task json`          | The plugin manifests and MCP configs are valid JSON                         |

Two checks sit outside `task check` because they need the network, and the pre-commit hook has to
work offline. Each is its own CI job:

- `task tools:check` verifies every MCP tool a skill names against the public manifest. It runs per
  pull request and daily, because the manifest changes when Layer ships and this repository does
  not: a renamed tool turns a correct skill into one that teaches an agent to invent a call, and
  only a scheduled check sees that.
- `task links` checks every link resolves, through Docker so CI and a local run share one code path.

Run `task format` before `task check` after writing markdown: prettier reflows prose and rewrites
tables, so `format:check` rejects correct hand-written markdown.

`skills.sh.json` is the single source of truth for grouping. `.claude-plugin/marketplace.json`, the
other plugin manifests, and the README skills table are generated from it (`task manifest`); never
edit any of them by hand.

Authoring helpers: `task new NAME=layer-something` writes a skeleton, `task words` prints the body
word count the budget is enforced against, and `task test:app` prints the application test prompt.
`task version:set VERSION=x.y.z` bumps the version and regenerates every manifest that declares it.

Conventional Commits, enforced by commitlint. Valid scopes are the skill directory names plus
`skills`, `ci`, `deps`, `docs`, `tooling`, and `evals`.

## Validation and testing

Mechanical validation checks the format. It cannot tell you whether the skill teaches. Before merging
a new or changed skill, run the application test.

### Application test protocol

1. Spawn a fresh agent with no conversation history and no repository context. Give it only: a
   framing line ("you are an agent connected to the Layer MCP server; the skill document below is
   installed"), the SKILL.md under test, the `layer` SKILL.md (real installs ship both), and one
   realistic task.
2. Ask for a numbered tool-call plan with exact tool names and argument shapes. Planning only: no
   execution, no browsing, and uncertainty must be flagged rather than guessed.
3. Pick a task that forces the skill's non-obvious facts (the upload flow, the estimate gate, the
   degradation report, a capability filter that is easy to miss), not one answerable from generic
   MCP intuition.
4. Grade the plan against the [tool reference](https://layer.ai/docs/mcp/tools) and the
   [manifest](https://layer.ai/.well-known/mcp), fetched fresh rather than recalled. Any of these is
   a fail:
   - A tool or parameter name that does not exist. One invented name fails the run.
   - A `base_model_id` asserted as a constant instead of discovered, outside the sanctioned
     utilities.
   - An `execute_*` with no `estimate_*` before it, or a spend over 20 CUs with no confirmation.
   - A fixed sleep instead of `poll_interval_seconds`.
   - A generation that consumes a local file without uploading it first, or a re-upload of an asset
     that already has a `file_id`.
   - Anything asserted that appears in neither the SKILL.md nor the public reference, even when it
     happens to be right.
5. A failure is a defect in the skill text, not in the agent. Fix the missing or ambiguous sentence,
   then re-run with a **new** fresh agent: the failed one is contaminated by its own mistake.
6. Baseline probe, once per new skill and not per edit: run the same task with no skill installed, to
   confirm the skill earns its context cost.
