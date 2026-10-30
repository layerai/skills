---
name: layer-game-ui
description: "Use when making game UI with Layer: buttons, panels, frames, dialogue boxes, tabs, tooltips, HUD elements, ability and inventory icons, currency symbols, or card and badge plates. Also when a button must stretch to any width without distorting its corners, when a UI kit must import into Unity, Godot or CSS, or when an icon set must read at 64px and match approved icons. Keywords: game UI, 9-slice, nine-slice, UI kit, button, panel, frame, HUD, icon set, NinePatch, border-image."
license: MIT
---

# Layer Game UI

## Overview

Game UI has two jobs that illustration does not: it resizes, and it reads at small sizes. A button
that looks right at one width and smears at another is broken; an icon that reads at 512px and turns
to mush at 64px is broken. Both are decided before generation, by what the prompt asks for and by
which delivery fields are set.

Layer handles the resize problem with `nine_slice` on `execute_forge`: after the run it finds the
plain band through the middle of each axis, makes the edges and centre tile, and records the 9-slice
insets on the file. `export_ui_kit` then writes those elements in the files an engine draws them by.
Generation mechanics, the spend gate and polling are in `layer`; prompt craft is in `layer-image`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Need                                | Use                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| Button, panel, frame, tab, tooltip  | `execute_forge` with `nine_slice: true`                                       |
| Anything that never resizes         | Omit `nine_slice`                                                             |
| Element that must match approved UI | Approved files as `reference_image`, model filtered for `image_editing`       |
| Icons on one canvas size            | `output_fit` with `canvas: "FIXED"`, `width`, `height`, `padding`             |
| Remove transparent margin           | `output_fit.trim: true`                                                       |
| Rounded card or badge plate         | Generate full bleed and opaque, then `output_fit.corner_radius`               |
| Transparent icon                    | `remove_background: true` (billed as its own run, so pass it to the estimate) |
| Engine import of resizable elements | `export_ui_kit` with `engine` `UNITY`, `GODOT`, `CSS` or `JSON`               |

## Resizable elements

A 9-slice element is nine pieces: four corners that never scale, four edges that repeat along one
axis, and a centre that repeats along both. The prompt has to produce an image that splits that way.

- **Ornament in the corners only.** Filigree, rivets, gems and bevels belong in the corners.
- **A plain or evenly textured middle.** Wood grain, parchment, or brushed metal tile well; a centred
  emblem, crest or label does not. An image with a centred emblem comes back without insets, and an
  element without insets cannot go into a UI kit.
- **A solid background colour.** Asked for a transparent background, models paint a checkerboard
  into the pixels. Name a flat colour that contrasts with the element instead.
- **No text.** A label belongs to the engine, which sets it over the element at any width.

Write it into the prompt in those words: "Ornate fantasy button frame, gold filigree in the four
corners only, plain dark leather centre, even straight edges, on a solid magenta background, no
text".

Keep `nine_slice` off for anything that does not resize: icons, portraits, a logo, a fixed-size
badge.

## Icons and sets

State the target pixel size in the prompt and design for the smallest one. The fix for an icon that
fails at 64px is fewer elements and heavier strokes, not a better upscale.

A set holds together by sharing a grammar, so name it in every prompt: stroke weight, corner radius,
perspective (flat, isometric, or slight three-quarter), palette, lighting direction, and whether
icons sit on a plate or float free. Extending a set is an editing job, not a generation job: attach
two or three approved icons as `reference_image` on a model filtered with
`capabilities: {image_editing: true}`, which reproduces what it is shown. `style_reference` carries
a look only and lets the grammar drift.

For delivery at one size, `output_fit` with `canvas: "FIXED"`, the target `width` and `height`, and
a fixed `padding` gives every icon the same box and margin; `trim: true` removes the transparent
margin first. A card or symbol plate gets its rounded shape from `corner_radius` on a full-bleed,
opaque, square-cornered generation, not from asking for a transparent background around a rounded
card.

## Delivery

`export_ui_kit` is a deterministic file operation and costs no Creative Units. It takes up to 128
`file_ids`, every one carrying 9-slice insets, in the order the kit should list them, and returns a
download link to a zip with a README of import steps and each element's insets.

| `engine` | What the zip holds                                                             |
| -------- | ------------------------------------------------------------------------------ |
| `UNITY`  | One atlas and the `.meta` that slices it into sprites with 9-slice borders     |
| `GODOT`  | One atlas and a StyleBoxTexture `.tres` per element, for themes, NinePatchRect |
| `CSS`    | One image per element and a stylesheet with a `border-image` rule for each     |
| `JSON`   | One atlas and TexturePacker JSON (hash) with each frame's borders              |

Edges and centre repeat without a seam in Unity, Godot and CSS. PixiJS and Phaser, reading the JSON,
stretch them instead, so tell users on those engines that a heavily textured centre will smear at
large sizes and a plainer one holds up better.

## Worked example

"A UI kit for our dark-fantasy RPG in Godot: primary button, secondary button, dialogue panel and
tooltip frame, matching the inventory panel we already approved."

1. The approved panel already has a `file_id`; no upload.
2. `list_base_models` with `filter.use_case: "text_to_image"` and
   `filter.capabilities: {image_editing: true}`; take the first result, then `get_base_model`.
3. Four runs, each with `nine_slice: true`, the approved panel as `reference_image`, and a prompt
   naming the shared grammar plus the element: "Primary button, wide, dark iron frame, silver
   filigree in the four corners only, plain dark leather centre, even straight edges, on a solid
   magenta background, no text".
4. `estimate_forge_price` once with those inputs, multiply by four, and ask above 20 CUs. Execute
   and poll `get_forge_run` at `poll_interval_seconds`.
5. Pick one output per element. Any that came back with an emblem or a busy centre will not carry
   insets: rerun that one with a plainer middle.
6. `export_ui_kit` with `engine: "GODOT"` and the four `file_ids`. Hand over the link and the
   README's insets.

## Common mistakes

- Asking a 9-slice element for a transparent background, then shipping the checkerboard.
- A centred crest or label on a button, which leaves it without insets.
- Setting `nine_slice` on icons, portraits and other fixed-size art.
- Judging an icon at full resolution instead of at its target size.
- Adding to an approved set with `style_reference` instead of `reference_image` on an
  `image_editing` model.
- Baking button text into the art.
- Asking for a rounded card on transparency instead of trimming it with `corner_radius`.
