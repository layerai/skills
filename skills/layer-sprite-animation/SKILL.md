---
name: layer-sprite-animation
description: "Use when animating a hand-painted, vector-style or HD 2D game character with Layer: idle, walk, run, attack, hit or death cycles, 4-direction or 8-direction sprites for a top-down or isometric game, or a character sprite sheet from a single approved design. Also when frames drift off-model, feet slide, or directions do not match. Keywords: sprite animation, animation cycle, walk cycle, idle, attack, 8-direction, 4-direction, turnaround, sprite sheet, flipbook, top-down, isometric."
license: MIT
---

# Layer Sprite Animation

## Overview

A sprite set is one character seen from several directions, doing several things, frame by frame,
and every frame has to be the same character standing on the same spot. Drawing frames one at a time
cannot hold that for HD art: there is too much detail to keep on-model. The reliable route is to
let the model hold identity twice, once across directions with a camera move and once across time
with a video clip, and only then cut frames.

Pixel art is different: its cycles are short and drawn frame by frame, in `layer-pixel-art`. Rigged
skeletal animation (Spine) splits a character into parts instead, in `layer-game-assets`. Generation
mechanics and the spend gate are in the `layer` skill; motion prompting is in `layer-video`.

`pack_sprite_sheet` and `split_sprite_sheet` are named outright below because they are Layer's
deterministic sheet utilities, tools rather than models, with no alternative to discover.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Step                    | Tool or input                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------ |
| One approved design     | `text_to_image`, neutral standing pose, isolated, at the game's camera pitch         |
| Directions              | `multi_angle` use case, approved design as source, `camera.yaw_degrees`              |
| Directions share a size | `output_fit`: `FIXED` canvas, `anchor: "BOTTOM_CENTER"`, same on every run           |
| A cycle per direction   | `image_to_video`, the direction still as `first_frame` (and `last_frame` for a loop) |
| Frames                  | The clip's `file_id` in an image slot at `video_frame_seconds`, `batch_size: 1`      |
| The sheet               | `pack_sprite_sheet`, one row per direction                                           |
| An existing sheet       | `split_sprite_sheet` with the grid it was made on, `trim_transparent` off            |

## Directions from one design

Generate and approve one design first, drawn at the game's camera: side view for a platformer,
three-quarter top-down for an RPG. Then make every other direction from it by moving the camera, not
by re-describing the character.

`execute_forge` takes a structured `camera` on models whose `get_base_model` capabilities report
`camera_transform`; filter `list_base_models` with `filter.use_case: "multi_angle"` to find them.
Attach the approved design as the slot the model supports (`init_image` or `reference_image`) and set
`yaw_degrees`: 90 is the right side, 180 the back, 270 the left. Eight directions step by 45. For a
top-down game keep one `pitch_degrees` on every direction, so the set shares a camera.

Generate every direction from the **original** front view, never from the previous direction, so
errors do not stack. Symmetric characters often need only five of eight directions, since engines
commonly mirror the left-facing ones; ask whether the game does before paying for all eight.

Set the same `output_fit` on every direction run: `canvas: "FIXED"`, one `width` and `height`, and
`anchor: "BOTTOM_CENTER"`, which stands every sprite on the same point. Without it, each direction
comes back at its own size and the character changes height when it turns. Run the approved front
view through the same model once with `camera` omitted (which keeps its view) and the same
`output_fit`, so the front shares the canvas too.

## Cycles from a clip

Animate each approved direction with `image_to_video`, passing it as `first_frame`. For a cycle that
repeats (idle, walk, run), filter for `loop` and `fixed_duration` and pass the same still as
`last_frame` too, so the motion returns to its start. One-shot actions (attack, hit, death) take
`first_frame` only.

The prompt has three jobs: the action, **in place**, and a still camera. "Walks in place, a full
stride cycle, body does not travel across the frame. Locked-off camera, plain flat background."
A character that walks out of frame cannot become a cycle.

## Frames out of the clip

Any image slot accepts a video `file_id` and takes one frame of it at `video_frame_seconds` (or
`video_frame`: `first`, `middle`, `last`). Pull evenly spaced frames, typically six to eight for a
walk, into a `background_removal` run each, at `batch_size: 1` since the default is four.

Frames from one locked-camera clip are already registered to each other. Pack them as they are:
`pack_sprite_sheet` centres each frame in one cell size without rescaling, so a registered cycle
stays registered. Do not refit or trim cycle frames one by one: anchoring each frame's bottom
erases a jump and makes a walk's bob vanish. When cutting an existing sheet with
`split_sprite_sheet`, leave `trim_transparent` off for the same reason.

## Worked example

"An 8-frame walk for our knight in four directions, for a top-down RPG."

1. The approved three-quarter front view has a `file_id`.
2. `list_base_models` with `filter.use_case: "multi_angle"`; `get_base_model` on the first result to
   confirm `camera_transform` and which slot it takes. Three runs at `yaw_degrees` 90, 180, 270,
   one shared `pitch_degrees`, and the same `output_fit: {canvas: "FIXED", width: 512, height: 512,
anchor: "BOTTOM_CENTER"}`. Approve one of each.
3. `list_base_models` with `filter.use_case: "image_to_video"` and
   `filter.capabilities: {loop: true, fixed_duration: true}`. Four clips, each direction as both
   `first_frame` and `last_frame`, prompted to walk in place.
4. Thirty-two frame runs (eight per clip) on a `background_removal` model.
5. Price all of it before the first run: three direction runs, four clips, thirty-two frame runs,
   each kind estimated as the run it will be. This will clear 20 CUs; ask and wait for an explicit
   yes.
6. Execute in that order, polling at `poll_interval_seconds`. Review each direction's frames
   together and redo any clip whose character drifted.
7. `pack_sprite_sheet` with all thirty-two `file_id` values in direction order, `columns: 8`.

## Common mistakes

- Drawing frames one at a time for HD art, so the character drifts.
- Generating each direction from the previous one instead of the original.
- Different camera pitch per direction.
- Leaving `output_fit` off, so the character changes size when it turns.
- A walk that travels across the frame instead of in place.
- Trimming or bottom-anchoring cycle frames individually, which erases the bob and jumps.
- Leaving `batch_size` at four on per-frame runs.
- Paying for eight directions when the engine mirrors three of them.
