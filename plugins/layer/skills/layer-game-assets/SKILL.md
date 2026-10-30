---
name: layer-game-assets
description: "Use when producing in-game characters and props with Layer: heroes, NPCs, enemies, bosses, mascots, creatures, items and props. Also when a cast must stay on-model across many images, when a set of sprites must share one canvas size and ground line, or when a character must be split into parts for a skeletal rig. Keywords: character art, NPC, enemy, mascot, cast, on-model, consistency, prop, item, sprite set, Spine, rigging."
license: MIT
---

# Layer Game Assets

## Overview

Game art differs from illustration in one way that governs everything: it has to sit in a system. A
character shares a cast, a prop shares a set. A beautiful asset that does not match its neighbours is
a defect.

Generation mechanics are in the `layer` skill and prompt craft is in `layer-image`. This skill covers
characters, casts, props, and rig-ready parts. Backgrounds and parallax are in `layer-environments`,
buttons, panels and icons in `layer-game-ui`, isometric and hex tiles in `layer-tilesets`, pixel art
in `layer-pixel-art`, and tiling surfaces in `layer-textures`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Need                              | How                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------- |
| A cast that holds its design      | Approved anchor attached as `reference_image`, model filtered for `image_editing` |
| A cast that grows for months      | Train a reference set (`layer-reference-sets`)                                    |
| Isolated sprite or prop           | Prompt a flat solid background and set `remove_background: true`                  |
| A set sharing one size and ground | `output_fit: {canvas: "FIXED", width, height, anchor: "BOTTOM_CENTER"}`           |
| Another angle of an approved one  | `camera` on a `multi_angle` model (`layer-image-editing`)                         |
| Parts for Spine                   | Neutral, limbs-apart pose, then `split_into_layers` (`layer-image-editing`)       |

## Characters and casts

A character prompt must name the **role** before the look. An enemy grunt, a shopkeeper, and a raid
boss are read differently by players, and silhouette carries that read before any detail does. State
silhouette explicitly: bulk, stance, and the one shape that identifies them at a glance.

Then pin the production terms a prompt cannot leave to chance: full body or portrait, view (front,
three-quarter, side), background treatment, and whether the pose is neutral for reference or dynamic
for key art.

A cast is the hard part. Writing the same adjectives twice does not produce the same character, and
seeds do not carry across prompts. Two things work:

1. **Anchor image.** Approve one hero image, then drive every sibling with it attached as
   `reference_image`, filtering for `image_editing`, which is the capability for art that must
   reproduce a provided subject. `style_reference` transfers a look only and will not keep the
   character, which is the usual reason an anchored cast still drifts.
2. **Trained style.** For a cast that will grow over weeks, train a reference set on approved art and
   apply it to every run. See `layer-reference-sets`.

The first is right for a handful of assets this week. The second is right for a live game.

## Props and sprite sets

Anything the engine composites needs a clean edge. A prompt asking for a transparent background is
not a transparency setting, and can come back as a painted checkerboard. Ask for a flat solid colour and set
`remove_background: true`, which chains Layer's background removal onto every output as its own
billed run (a model with native transparency returns its own alpha instead). Pass it to the estimate
too.

A set must also share a size. Set `output_fit` with `canvas: "FIXED"`, the delivery `width` and
`height`, and `anchor: "BOTTOM_CENTER"`, so every sprite stands on the same point of the same canvas
and the engine needs no per-asset offsets. Use `trim: true` instead when each asset should be cropped
to its own bounds.

Hold a prop set together by naming its shared grammar in every prompt: view angle, outline weight,
palette, material finish, and scale against a reference object ("a sword about as long as the hero
is tall").

## Rig-ready characters

A character destined for Spine or a skeletal rig needs its parts separable. Generate the character
in a neutral, limbs-apart pose so no part occludes another, on a flat background, then separate the
parts with `layer-image-editing` using `split_into_layers`.

Occlusion is the thing to get right up front: a crossed arm or a cloak covering the torso means the
hidden geometry does not exist in any layer, and no amount of splitting recovers it. Say
"arms clear of the body, legs apart, cape swept behind and clear of the torso" in the prompt.

## Worked example

"Three shopkeeper NPCs matching our approved hero, delivered as sprites at one size."

1. The approved hero already has a `file_id` from its original run.
2. `list_base_models` with `filter.use_case: "text_to_image"` and
   `filter.capabilities: {image_editing: true}` (an object of booleans, not a list of names). Take
   the first result.
3. One run per NPC. Each attaches the hero as `reference_image`, sets `remove_background: true` and
   `output_fit: {canvas: "FIXED", width: 1024, height: 1024, anchor: "BOTTOM_CENTER"}`, and puts role
   and silhouette first: "Village blacksmith shopkeeper NPC, broad and short, heavy leather apron,
   arms folded. Full body, three-quarter front view, neutral standing pose, same rendering, line
   weight and palette as the reference. Flat solid grey background."
4. The three runs differ only in prompt, so one `estimate_forge_price` times three prices the job.
   Above 20 CUs, show the total and wait for an explicit yes.
5. Execute, poll at `poll_interval_seconds`, and review the three side by side at in-game scale
   against the hero, not one at a time at full size.

## Common mistakes

- Rewriting the same description and expecting the same character.
- Using `style_reference` to hold a character; it carries the look, not the design.
- Prompting for a transparent background instead of a flat colour plus `remove_background`.
- Delivering a sprite set at mixed canvas sizes and ground lines.
- Generating a rig-ready character in a pose where limbs occlude the torso.
- Leaving background treatment unstated on an asset that will be composited.
- Judging a cast member alone instead of beside the anchor.
