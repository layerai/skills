---
name: layer-vfx
description: "Use when generating game visual effects with Layer: spell and skill effects, hit impacts, explosions, pickups and power-ups, loot chest and reward openings, auras, portals, or looping ambient effects such as fire, smoke and magic swirls. Also when an effect comes back with a scene around it, cannot be blended in the engine, or plays with no wind-up. Keywords: VFX, FX, spell effect, impact, explosion, particle, flipbook, aura, loot chest, additive, sprite sheet."
license: MIT
---

# Layer VFX

## Overview

An effect is not an illustration of magic. It is a short, isolated piece of motion that an engine
layers over gameplay, so it has to arrive with nothing around it, on a background the engine can
remove, timed so a player reads it in a fraction of a second. Most failed effects fail on one of
those three, not on how they look.

The route is: design the effect as a still, animate the still into a short clip, then pull frames
from the clip into a flipbook. Generation mechanics and the spend gate are in the `layer` skill;
motion prompting is in `layer-video`.

`pack_sprite_sheet` is named outright below because it is Layer's deterministic packing utility, a
tool rather than a model, with no alternative to discover.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Need                       | Do this                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| Fire, magic, light, sparks | Solid black background, for additive blending                                            |
| Smoke, dust, debris, ink   | Flat key colour, then remove it per frame; these need real alpha                         |
| The look                   | `text_to_image` still, one effect, centred, nothing else in frame                        |
| The motion                 | `image_to_video` with the still as `first_frame`                                         |
| A looping effect           | `loop` capability, the same still as `first_frame` and `last_frame`                      |
| A locked camera            | `video_effects: [{type: "STATIC"}]` where the model exposes it, and say it in the prompt |
| Frames out of the clip     | The clip's `file_id` in an image slot with `video_frame_seconds`, one run per frame      |
| The flipbook               | `pack_sprite_sheet` with the frames' `file_ids` in play order                            |

## Background decides the blend

Engines composite effects one of two ways, and the background has to match.

- **Additive** (fire, lightning, glows, magic trails, sparks): the engine adds the effect's colour to
  the scene, so pure black vanishes. Ask for "pure black background, no floor, no environment, no
  ground glow". Black here is a feature, not a placeholder, and removing it would destroy the glow
  falloff.
- **Alpha-blended** (smoke, dust, rubble, water splashes, dark magic): these darken or occlude, so
  black cannot stand in for transparency. Generate on one flat key colour that does not appear in
  the effect, then remove it frame by frame with a `background_removal` model. Wispy edges suffer,
  so prefer dense, defined shapes for these effects.

Do not promise transparent video. Nothing in a video run's schema delivers an alpha channel, so
transparency is made on the extracted frames, not on the clip.

## Isolate and centre

One effect per run, centred, fully inside the frame with margin on every side. A fireball that
leaves the frame cannot be repositioned in an engine, and a second effect in frame has to be cut out
by hand. Say it: "a single effect, centred, entirely within frame, nothing else in the image, no
characters, no scenery".

Effects are seen small and fast: one bright core, one readable shape, one colour that says what the
effect does.

## Timing reads

A one-shot effect has three phases, and the prompt should name all of them with rough timings:
**anticipation** (a gather or charge), **burst** (the peak, fast), **dissipation** (falloff to
nothing). An effect that starts at full intensity reads as a glitch, and one that never fully fades
leaves a ghost on its last frame. End one-shots on empty black.

Loops (auras, portals, torch flames) have no beginning or end: cyclical motion only, and the loop
capability. See `layer-video` for why prompting "looping" alone produces a clip that jumps at the
seam.

## Frames out of the clip

Any image slot (`init_image`, `reference_image`, `first_frame`, `last_frame`) accepts a video
`file_id` and takes one frame of it, chosen by `video_frame` (`first`, `middle`, `last`) or by
`video_frame_seconds`, which overrides it. Space the timestamps evenly across the clip: eight to
twelve frames is a typical flipbook. Each frame is one run of whatever model receives it, so give the
frame a run that does useful work anyway: background removal for alpha-blended effects, an upscale
when the clip resolution is too low. Use `batch_size: 1`, since the default is four.

Some frame-extraction models take an `init_video` and a `frame_extraction_location` instead;
`get_base_model` says which inputs a model requires.

Frames from one locked-camera clip are already registered, so `pack_sprite_sheet` keeps them aligned:
it centres each frame at its own scale in one cell size. Do not trim frames individually first, or
the effect will jitter.

## Worked example

"A fireball impact for our top-down RPG, as an 8-frame flipbook."

1. `list_base_models` with `filter.use_case: "text_to_image"`, first result. Prompt: "Game VFX, a
   single fireball impact at the moment of burst, orange-white core, licking flames, flying embers,
   centred, entirely within frame, pure black background, no ground, no scenery, top-down view."
   Approve one.
2. `list_base_models` with `filter.use_case: "image_to_video"` and
   `filter.capabilities: {fixed_duration: true}`; `get_base_model` on the first result to see which
   frame slots and `video_effects` it takes.
3. Motion prompt with phases: "A small ember gathers for a quarter second, bursts outward fast, then
   flames and embers dissipate to nothing by the end. Locked-off camera, black background throughout."
   Pass the approved still's `file_id` as `first_frame`, `video_effects: [{type: "STATIC"}]` if supported,
   a short `duration_seconds`.
4. Price the job as a whole: the video plus eight frame runs, each estimated as the run it will be.
   Over 20 CUs, ask and wait for an explicit yes.
5. Execute, poll at `poll_interval_seconds`. Pull eight frames at evenly spaced
   `video_frame_seconds`, each into an upscaling run at `batch_size: 1`. Keep the black.
6. `pack_sprite_sheet` with `file_ids` set to the eight frames in play order and `columns: 4`.

## Common mistakes

- Removing the black background from an additive effect, which deletes the glow.
- Using black as the background for smoke or dust, which then cannot occlude anything.
- A scene, floor, or character in the frame around the effect.
- An effect that clips the frame edge.
- A one-shot with no anticipation, or one that never fully fades.
- Promising a transparent video.
- Trimming frames one by one before packing, so the flipbook jitters.
- Leaving `batch_size` at four on per-frame runs and paying four times.
