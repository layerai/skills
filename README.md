# Layer Skills

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Agent Skills for [Layer](https://layer.ai) that teach **creative craft**: how to direct a generation
so the asset that comes back is usable. Sprites that read at 32px, textures that tile without a seam,
a cast that holds its design across a dozen images, a storyboard with one beat per panel.

They drive the [Layer MCP server](https://layer.ai/docs/mcp) and work with Claude Code, Cursor,
Codex, VS Code, and any agent that reads `SKILL.md`.

## Install

```bash
npx skills add layerai/skills --skill "*"
```

`--skill "*"` takes every skill and skips the picker. Running the bare command opens a picker with
nothing preselected, so pressing enter installs nothing.

As a Claude Code plugin marketplace, which also wires up the MCP server:

```bash
/plugin marketplace add layerai/skills
```

## Prerequisites

These skills call the Layer MCP server at `https://mcp.app.layer.ai/mcp` over streamable HTTP,
authenticated with OAuth. Add it once:

```bash
claude mcp add --transport http Layer https://mcp.app.layer.ai/mcp
```

Other clients, Personal Access Tokens, and troubleshooting are covered in
[Setup](https://layer.ai/docs/mcp/setup).

## How this fits with Layer's published skills

Layer serves six skills from the product itself, discoverable at
[`layer.ai/.well-known/agent-skills/`](https://layer.ai/.well-known/agent-skills/index.json). They
teach **platform mechanics**, REST first: authentication, connecting a client, the request shape,
polling, training, and workspace administration.

This repository is the **craft layer above them**. It does not restate the mechanics; it answers the
questions they leave open. Which model for this task, what the prompt must name, how to hold a
character consistent, why a texture seams. The two are designed to be installed together.

## Skills

<!-- skills:start -->

### Getting started

Connect to Layer and learn the generation loop every other skill builds on: model discovery, the spend gate, uploads, and polling.

| Skill                            | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer`](skills/layer/SKILL.md) | Use when generating or editing game and entertainment assets on Layer through MCP: images, video, 3D meshes, audio, sprites, textures, or marketing creative. Also when choosing a Layer base model, pricing a run in Creative Units before spending them, uploading reference files, polling a generation, applying a trained style, or recovering from MODEL_NOT_FOUND, INSUFFICIENT_BALANCE, RATE_LIMITED, or a silently degraded reference set. |

### Direction

Agree a look before generating at volume: moodboards, storyboards, colour, era, and framing.

| Skill                                                        | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-art-direction`](skills/layer-art-direction/SKILL.md) | Use when a Layer brief needs a direction before generating at volume: exploring a look with a moodboard, choosing between visual directions, storyboarding an ad, trailer or cutscene, pinning a colour palette, naming a style or era precisely, or framing a scene. Also when a brief is vague or generations keep missing an unstated intent. Keywords: art direction, moodboard, style exploration, storyboard, panels, beats, palette, composition, framing, era, reference. |

### Images

Generate stills and change the ones you already have: prompting, sizing, references, masked edits, reframing, upscaling, and layers.

| Skill                                                        | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-image`](skills/layer-image/SKILL.md)                 | Use when generating a still image with Layer: concept art, key art, illustrations, marketing images, icons, or any text-to-image run. Also when a prompt is not landing, when the aspect ratio or resolution is wrong, when a style or pose reference should steer the result, when readable text must appear in the image, or when several images must share one look. Keywords: txt2img, text to image, prompt, aspect ratio, negative prompt, style reference, seed.           |
| [`layer-image-editing`](skills/layer-image-editing/SKILL.md) | Use when changing an image that already exists on Layer rather than generating a new one: editing or replacing part of it, inpainting with a mask, outpainting or extending the frame, reframing to another aspect ratio, relighting, restyling, re-rendering from another camera angle, splitting into layers, removing a background, vectorising, or upscaling. Keywords: img2img, edit, inpaint, outpaint, mask, expand, turnaround, upscale, background removal, PSD, layers. |

### Game art

Art that has to sit in a system: characters and casts, environments and parallax, game UI, pixel sprites and sheets, and seamless textures.

| Skill                                                    | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-game-assets`](skills/layer-game-assets/SKILL.md) | Use when producing in-game art with Layer: characters, heroes, NPCs, enemies and mascots, environment and background concept art, parallax layers, or game UI such as icons, buttons, frames, panels, HUD elements and currency symbols. Also when a cast must stay on-model across many images, when an icon must read at 64px, or when a character must be split into parts for a skeletal rig. Keywords: character art, NPC, enemy, concept art, background, parallax, game UI, HUD, icon set, Spine, rigging. |
| [`layer-pixel-art`](skills/layer-pixel-art/SKILL.md)     | Use when making pixel art with Layer: sprites, retro game characters, pixel icons, pixel tiles, or a sprite sheet and walk cycle. Also when generated pixel art comes back blurry, anti-aliased, or at the wrong grid size, and when packing separate frames into a sheet or cutting an existing sheet into frames. Keywords: pixel art, sprite, sprite sheet, spritesheet, 16-bit, 32x32, walk cycle, animation frames, palette, dithering, pack, split.                                                         |
| [`layer-textures`](skills/layer-textures/SKILL.md)       | Use when generating a texture with Layer that must repeat without a visible seam: ground, terrain, walls, fabric, foliage, stone, wood, pattern fills, or a tiling material for a game engine. Also when a generated texture shows seams at its edges, an obvious repeating motif across a surface, or baked-in lighting that fights the engine. Keywords: tileable, seamless, tiling, texture, material, pattern, trim sheet, terrain, repeat.                                                                   |

### Video and audio

Motion and sound: animating stills, camera and loops, sound effects, music, speech, and cutting shots into one finished video.

| Skill                                                          | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-video`](skills/layer-video/SKILL.md)                   | Use when generating video with Layer: text-to-video, animating a still image, extending a clip, adding camera motion, generating native audio or lip sync, looping animations, or planning a multi-shot ad, trailer, or cutscene. Also when a video prompt produces the wrong motion or the shot drifts off the source image. Keywords: txt2vid, img2vid, image to video, camera motion, video effects, loop, seamless, trailer, cutscene, lipsync.                          |
| [`layer-audio`](skills/layer-audio/SKILL.md)                   | Use when generating audio with Layer: sound effects for a game or trailer, music and background tracks, or speech and voice-over from text. Also when a sound effect comes back with unwanted ambience or reverb, when a music prompt needs structure or length control, or when choosing a voice and delivery for narration. Keywords: SFX, sound effect, foley, UI sound, music, soundtrack, loop, text to speech, TTS, voice over, narration.                             |
| [`layer-video-timeline`](skills/layer-video-timeline/SKILL.md) | Use when assembling assets a user already has into one finished video with Layer: sequencing clips, adding transitions, overlaying text, captions, a logo or a CTA, layering music or voice-over, or cutting a trailer, ad, or promo from generated shots. Also when a multi-shot piece needs to become a single deliverable file. Keywords: video editor, timeline, assemble, stitch, sequence, concatenate, transitions, overlay, captions, CTA, trailer, montage, render. |

### 3D

Meshes for a game engine: generation from text or image, remeshing, retexturing, rigging, and animation.

| Skill                                  | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-3d`](skills/layer-3d/SKILL.md) | Use when producing 3D assets with Layer: generating a mesh from text or an image, retopologising or remeshing, retexturing an existing mesh, rigging a character, or animating a rigged mesh. Also when choosing between quad and triangle output, setting a polygon budget, or asking for PBR textures for a game engine. Keywords: 3D, mesh, model, text to 3D, image to 3D, remesh, retopology, retexture, rig, skeleton, animate, PBR, quad mesh, poly count, glTF, FBX. |

### Consistency and pipelines

Hold one look across a whole project with trained reference sets, and run the Blueprint workflows a studio has already built.

| Skill                                                          | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-reference-sets`](skills/layer-reference-sets/SKILL.md) | Use when a look must hold across many Layer generations: training a custom style or LoRA on a studio's own artwork, curating the images that go into a reference set, choosing its training category, tuning reference-set weight on a run, or deciding whether to train at all rather than attach a style reference. Also when a trained style produces weak, inconsistent, or silently ignored results. Keywords: LoRA, custom model, trained style, reference set, consistency, on-model, art direction, dataset. |
| [`layer-workflows`](skills/layer-workflows/SKILL.md)           | Use when running a saved Layer Blueprint workflow rather than a single generation: discovering what workflows a workspace has, reading a workflow's input schema, estimating and executing a run, polling its steps, or cancelling it. Also when a repeatable multi-step pipeline exists for a task, when the user names a workflow, or when a workflow input expects a style or a file. Keywords: workflow, blueprint, pipeline, app, multi-step, run, node graph.                                                  |

### Review

Judge a batch before it ships: scoring rules, verdicts, and reviewing a set against the brief.

| Skill                                            | Use when                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-quality`](skills/layer-quality/SKILL.md) | Use when judging Layer output before it ships: scoring generated files against a workspace's output scoring rules, reading back verdicts on a file, reviewing a batch against the brief, or choosing which candidate to deliver. Also when a studio has automated quality standards, or a set must be checked for consistency before handoff. Keywords: quality gate, scoring, review, batch, verdict, approve, QA, consistency check. |

<!-- skills:end -->

## Contributing

Read [AGENTS.md](AGENTS.md) first: it is the authoring contract, and it defines the frontmatter
rules, the description format, the word budget, the ban on hard-coded model ids, and the application
test every new skill has to pass. [CONTRIBUTING.md](CONTRIBUTING.md) covers the mechanics.

```bash
pnpm install
pnpm format && pnpm validate
```

## License

MIT
