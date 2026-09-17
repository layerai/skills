## What this changes

<!-- One or two sentences. The PR title becomes the commit header on main, so write it as one. -->

## Checks

- [ ] `task format && task check` passes locally
- [ ] `task tools:check` and `task links` pass
- [ ] Every new factual claim is verifiable from a public surface (tool reference, MCP manifest, or the server's own instructions)
- [ ] No `base_model_id` asserted as a constant, outside the sanctioned first-party utilities
- [ ] Nothing here is internal: no hostnames, workspace or project ids, signed URLs, or credentials

## For a new or changed skill

- [ ] Application test run and passed ([protocol](../AGENTS.md#application-test-protocol)); paste the task used and anything the agent had to flag
- [ ] Baseline probe run, if this is a new skill

<!-- If an agent wrote this change, say so, and confirm a human reviewed the complete diff. -->
