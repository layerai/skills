# Evals

Mechanical validation (`task check`) checks that a skill is well formed. It cannot tell you
whether the skill teaches. That is what the application test does, and it is the gate a new or
changed skill has to pass before merging.

## Application test

The protocol is defined in [AGENTS.md](../AGENTS.md#application-test-protocol). The short version: a
clean-room agent with no repository context gets the skill under test, the `layer` skill, and one
realistic task; it returns a tool-call plan without executing anything; the plan is graded against
the public tool reference fetched fresh.

Generate the prompt:

```bash
task test:app NAME=layer-pixel-art \
  TASK="We need a 32x32 walk cycle for our knight sprite, four frames, packed into one sheet."
```

Paste the output into a fresh agent session with no history. Grade the returned plan. Any of these
fails the run:

- A tool or parameter name that does not exist.
- A `base_model_id` asserted as a constant rather than discovered, outside the sanctioned
  first-party utilities (`pack_sprite_sheet`, `split_sprite_sheet`, `render_video_timeline`).
- An `execute_*` with no `estimate_*` before it, or a spend over 20 CUs with no confirmation.
- A fixed sleep instead of `poll_interval_seconds`.
- Consuming a local file without uploading it, or re-uploading an asset that already has a
  `file_id`.
- Anything asserted that appears in neither the skill nor the public reference, even when it happens
  to be right.

A failure is a defect in the skill text, not in the agent. Fix the sentence, then re-run with a
**new** agent: the failed one is contaminated by its own mistake.

## Choosing the task

Pick one that forces the skill's non-obvious facts. A task any agent could plan from generic MCP
intuition tests nothing. Good tasks make the agent reach for the capability filter that is easy to
miss, the upload flow, the degradation report, or the estimate gate.

## Baseline probe

Once per new skill, not per edit: run the same task with no skill installed. If the plan is just as
good, the skill is not earning its context cost.

## Live runs

Anything that actually executes a generation spends Creative Units. Run those against a dedicated
eval workspace with a capped balance, never a studio's working one, and never from CI on an
untrusted pull request.
