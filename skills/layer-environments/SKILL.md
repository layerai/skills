---
name: layer-environments
description: "Use when producing game environments with Layer: background and environment concept art, a side-scroller parallax background split into scrolling layers, a 360 skybox or panorama, or a generated world. Also when parallax layers do not line up or loop, when a background is too busy to read gameplay against, or when exporting layers to Godot or Unity. Keywords: environment, background, parallax, layers, side-scroller, platformer, skybox, 360, equirectangular, panorama, world."
license: MIT
---

# Layer Environments

## Overview

An environment is the art the player looks through, not at. It has to hold depth, sit behind
gameplay without competing with it, and, for a parallax background, come apart into layers that move
at different speeds and still line up.

Generation mechanics (model discovery, the estimate gate, uploads, polling) are in the `layer` skill;
prompt craft is in `layer-image`. Characters and props are in `layer-game-assets`, isometric and hex
tiles in `layer-tilesets`, and tiling surfaces in `layer-textures`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Deliverable             | How                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| Environment concept art | `text_to_image`; name camera height and depth tiers                                                     |
| Parallax background     | Generate one scene, then `execute_forge` with `parallax` on an `inpainting` or `erase_object` model     |
| Parallax for an engine  | `export_parallax` on the split's output, engine `GODOT`, `UNITY` or `JSON`                              |
| 360 skybox              | `use_case: "create_skybox"` with `projection: "EQUIRECTANGULAR"`                                        |
| World                   | `use_case: "text_to_world"` or `"image_to_world"`; iterate with `draft: true` where the model offers it |

## Environment concept art

Name the camera height and the depth tiers, because these decide whether a background sits behind
gameplay. Say which tier the art belongs to: foreground silhouette, midground playable band, far
background. Keep contrast and saturation deliberately low where characters will stand. The most
common note on generated game backgrounds is that they are too busy to read characters against.

## Parallax: one scene, split by depth

Do not generate parallax layers one at a time. Separate runs never share a horizon, a light, or a
vanishing point, and `export_parallax` refuses them: it takes only the output of a parallax split.

The split is one `execute_forge` run with the finished scene as `init_image` and `parallax` set, on a
model found with `list_base_models` and `filter.use_case: "inpainting"` or `"erase_object"`. That
model fills in what each nearer layer hides. Given no prompt, an inpainting model is told to continue
the scenery, which is usually what you want.

`parallax` takes three fields:

- `layers`: 2 to 6, default 5.
- `cuts`: where to slice, as ascending nearness values between 0 and 1, one fewer than `layers`.
  Omit it to cut at the gaps in the scene's own depth, which is the right default.
- `loop`: every layer repeats left to right, each plate healed across its wrap.

The output is one layered PSD, farthest layer at the bottom, with each layer's scroll speed recorded.
Pass its `file_id` to `export_parallax` with the engine: `GODOT` writes a Parallax2D scene for Godot
4.3 or later, `UNITY` writes sprites with their `.meta` and a `parallax.json` of scroll factors, and
`JSON` writes the images and `parallax.json` for any engine. Every layer is written at the
background's full size, so placed at one point they line up. The export spends no Creative Units.

A split bills one run of the model per layer except the nearest, and `loop` adds one heal per plate.
Estimate it with exactly the inputs the run will get, `parallax` included, before deciding.

### Compose the scene for splitting

The split can only separate what the scene already separates. Prompt the source for it:

- **Side-on camera, wide frame.** A side-scroller background is landscape; filter for
  `landscape_16_9` when choosing the model.
- **Distinct depth bands with air between them**: sky, far range, midground, near foreground. A
  single tree that runs from the near edge into the far hills will be cut through.
- **A quiet gameplay band.** Low contrast where characters stand, detail kept to the far layers and a
  sparse foreground silhouette.
- **For a loop, no unique landmark.** A lone castle on one plate repeats every screen width.

## Skyboxes

A skybox is a 2:1 equirectangular panorama whose left and right edges meet and whose poles settle.
Find a model with `filter.use_case: "create_skybox"` and pass `projection: "EQUIRECTANGULAR"`. Do not
also set `tileability`; the projection already makes the wrap. Leave `width` and `height` unset to get
the model's largest 2:1 preset, or use one of the presets `get_base_model` lists. Prompt the sky and
the horizon, not a subject: anything framed as a focal point is stretched across the poles.

## Worlds

A world is its own modality, found with `filter.use_case: "text_to_world"` or `"image_to_world"`.
Where `get_base_model` reports `capabilities.draft`, iterate on cheap drafts with `draft: true`, then
complete only the one you keep: `execute_forge` with `base_model_id` set to the draft's
`draft.completion_base_model_id`, `batch_size: 1`, and the draft's `file_id` as a guidance file of
type `draft_world`, with no prompt. The completion keeps the draft's scene, has a flat price, and can
happen once. Check `draft.status` first: an `EXPIRED` draft must be generated again.

## Worked example

"A looping four-layer forest background for our Godot platformer."

1. `list_base_models` with `filter.use_case: "text_to_image"` and
   `filter.capabilities: {landscape_16_9: true}` (an object of booleans). Take the first result.
2. Prompt the source: "Side-on view of a misty pine forest for a 2D platformer background, wide
   landscape. Four distinct depth bands with clear space between them: pale sky, distant blue
   mountains, a midground of pine trunks, a sparse dark foreground of ferns along the bottom edge.
   Low contrast and muted greens in the middle band where characters run. No buildings, no single
   landmark." Estimate, execute with `batch_size: 4`, poll at `poll_interval_seconds`, pick one.
3. `list_base_models` with `filter.use_case: "inpainting"`. Take the first result.
4. `estimate_forge_price` with that model, the chosen scene's `file_id` as `init_image`,
   `batch_size: 1`, no prompt, and `parallax: {layers: 4, loop: true}`. The estimate prices the
   per-layer runs and the loop heals together. Above 20 CUs, show the price and wait for an explicit yes.
5. `execute_forge` with the same input; poll at `poll_interval_seconds`. Report any degraded
   reference set.
6. `export_parallax` with the PSD's `file_id`, `engine: "GODOT"`, and a `name`. Hand back the zip
   link and point the user at its README.

## Common mistakes

- Generating each parallax layer as a separate run. They will not line up, and `export_parallax`
  refuses them.
- Running the split on a plain generation model instead of an `inpainting` or `erase_object` one.
- A source scene with one object spanning several depth bands, which the split cuts in half.
- Passing `cuts` with the wrong count: it is always one fewer than `layers`.
- A busy, high-contrast gameplay band that characters cannot read against.
- A unique landmark in a looping background.
- Setting `tileability` on a skybox, or framing a focal subject that stretches across the poles.
- Completing a world draft with a new prompt, or completing an expired one.
