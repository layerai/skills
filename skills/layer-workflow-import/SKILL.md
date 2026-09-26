---
name: layer-workflow-import
description: "Use when bringing a workflow built in another tool into Layer: a ComfyUI graph (workflow or API JSON), a Krea node workflow, a Scenario workflow, or a pipeline described in prose or a screenshot. Also when converting, porting, migrating or rebuilding a node graph as a Layer Blueprint workflow. Keywords: import workflow, ComfyUI, Comfy JSON, Krea nodes, Scenario, convert, port, migrate, node graph, blueprint."
license: MIT
---

# Layer Workflow Import

## Overview

A workflow from another tool becomes a private Layer workflow in three moves: read what the source
does, rebuild it from Layer's node kinds, and hand the whole graph to `import_workflow`. The import
never makes anything public or featured; sharing is a separate step the user takes in the Layer app.

This skill is for building a new workflow from a foreign one. To run a workflow that already exists
in the workspace, use `layer-workflows`. The spend gate and polling rules live in the `layer` skill.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Translate intent, not nodes

Other tools expose the machinery; Layer exposes the task. A ComfyUI text-to-image graph is a
checkpoint loader, a text encoder per prompt, an empty latent, a sampler and a VAE decode. In Layer
that is one generate node with a prompt, a size and a model. Read the source for what goes in, what
each step does to it, and what comes out, then express that with the fewest Layer nodes that do the
same job. A one-to-one port of sampler plumbing does not exist and should not be attempted.

The per-source reading guide (how to tell ComfyUI's two JSON formats apart, where the prompts and
models sit, what Krea and Scenario exports look like) is in [references/sources.md](references/sources.md).

## Quick reference

| Step            | Tool                                          | Notes                                                        |
| --------------- | --------------------------------------------- | ------------------------------------------------------------ |
| Learn the parts | `get_blueprint_system_config`                 | Node kinds, their ports and value schemas. Call once, reuse. |
| Pick models     | `list_base_models`, `get_base_model`          | Discover by use case. Never copy the source's model name.    |
| Sample files    | `request_file_upload_url` or `upload_file`    | A file input's default needs a `file_id`.                    |
| Check the graph | `import_workflow` with `validate_only: true`  | Creates nothing. Fix every problem it reports.               |
| Import          | `import_workflow`                             | Publishes privately by default so it can run.                |
| Prove it runs   | `estimate_workflow_price`, `execute_workflow` | Spend gate applies. Poll `get_workflow_run`.                 |
| File it         | `list_projects`, then `project_id` on import  | Optional: land the workflow in a project for review.         |

## The graph

`import_workflow` takes `graph` with three maps:

- `inputs`: what the person running the workflow provides. Each maps a key to
  `{key, type, display_name, is_required, default_value}`. Prompts and images are inputs; values the
  workflow fixes are not.
- `nodes`: node id to `{id, stable_id, kind, display_name, inputs}`. Both ids are UUIDs you generate;
  `kind` is a node kind key from `get_blueprint_system_config`. Each entry in a node's `inputs` is
  `{port_key, value, refs}`: a static `value`, or `refs` naming what feeds it.
- `outputs`: what the workflow saves. Key to `{key, type, display_name, refs}`.

There is no edge list. A connection is a ref on the receiving side, `{"_default": [...]}`, holding
`blueprint::<input key>` for a workflow input or `nodes::<node id>[<kind key>]::<port key>` for
another node's output. A port type must match what feeds it; the system config's casting rules list
the allowed pairs.

Static values follow the port type's JSON schema from the system config, including the shape of a
prompt or a size. A model port takes a `base_model_id` from `list_base_models`, filtered by the use
case the node serves.

## The loop

1. `get_blueprint_system_config` for the workspace.
2. Read the source and write down inputs, steps and outputs in plain words.
3. Map each step to a node kind. When nothing fits, stop and tell the user which step has no Layer
   equivalent, rather than approximating it with an unrelated node.
4. Build the graph. Upload one sample file per file input and set it as the input's `default_value`
   so the workflow runs with one click.
5. `import_workflow` with `validate_only: true`. The result groups problems by node, input and output.
   Fix and repeat until `is_valid` is true.
6. `import_workflow` for real, with a clear `name` and a `description` that says where it came from.
   Pass `project_id` when the user wants it filed in a project.
7. `estimate_workflow_price` with the sample inputs, confirm above 20 CUs, then `execute_workflow`
   and poll. A graph that validates can still produce the wrong thing; look at the output.
8. Report: the workflow id, what was mapped to what, and anything dropped or approximated.

`publish: false` keeps a draft instead of a runnable workflow, and is accepted even with validation
problems. Use it only when the user wants to finish the graph by hand in the editor.

## Worked example

"Import this ComfyUI workflow." The JSON has `nodes` and `links` arrays, so it is the UI format.

1. Reading it: a `CheckpointLoaderSimple` with an SDXL checkpoint, a `LoraLoader` with a pixel-art
   LoRA, two `CLIPTextEncode` nodes (positive and negative prompt), `EmptyLatentImage` at 1024x1024,
   `KSampler`, `VAEDecode`, then a 2x upscale model and `SaveImage`.
2. Intent: text in, pixel-art image out, upscaled 2x. Inputs: the prompt. Fixed: size, the style.
3. `get_blueprint_system_config`, then pick a generate-image node kind and an upscale node kind whose
   ports fit. The LoRA is the source's way of getting a pixel look. If the generate node kind has a
   style port, ask whether the workspace has a pixel-art reference set (`list_reference_sets`) for
   it; otherwise fold the style into the prompt. Never pass the LoRA file name as a model.
4. `list_base_models` with the text-to-image use case; take the first result for the generate node.
5. Graph: input `prompt`; generate node whose prompt port refs `blueprint::prompt`; upscale node whose
   image port refs the generate node's image output; output `images` reffing the upscale output.
6. `validate_only` reports the upscale node's image port as the wrong type. The system config shows
   a casting rule from the generate output's type, so the ref was on the wrong port; fix it.
7. Import, estimate (6 CUs), run with a sample prompt, check the image is upscaled and pixel-styled.
8. Report: "Imported as a private workflow. KSampler, VAE and latent plumbing became one generate
   node. The LoRA became a reference set. The negative prompt was dropped: the chosen model has no
   negative prompt port."

## Common mistakes

- Porting sampler, latent and VAE nodes one to one instead of collapsing them into a generate node.
- Copying a checkpoint or LoRA file name into a model port instead of discovering a `base_model_id`.
- Importing without `validate_only` first, then debugging a rejected import.
- Leaving a required file input with no sample, so the workflow cannot run from the app.
- Silently approximating a step Layer has no node for. Say which step and why.
- Promising the workflow is shared. It is private; sharing happens in the Layer app.
- Skipping the test run. Validation checks wiring, not whether the output is right.
