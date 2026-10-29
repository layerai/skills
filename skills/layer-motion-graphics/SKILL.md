---
name: layer-motion-graphics
description: "Use when making motion graphics with Layer: a logo reveal or sting, an idle logo loop, animated titles, lower thirds, an end card or CTA card, kinetic type, or a branded intro or outro for a trailer or ad. Also when a reveal lands on a distorted logo, when generated lettering comes back misspelled, or when text must move without keyframes. Keywords: motion graphics, logo reveal, logo animation, sting, title card, lower third, end card, kinetic typography, intro, outro."
license: MIT
---

# Layer Motion Graphics

## Overview

Motion graphics on Layer split into two jobs that must not be mixed. **Pictures that move** (a logo
assembling, an emblem catching light) are a generation with a video model. **Words** are never
generated: video models misspell, cannot use a font file, and drift between frames. Words go on as
text items in a `render_video_timeline` edit, set in the brand font.

Generation mechanics are in the `layer` skill and motion prompting in `layer-video`. Timeline
assembly basics (cutting, safe areas, audio length) are in `layer-video-timeline`, and exact text on
stills is `layer-typography`. Reusing one motion design for many variants is `layer-motion-templates`;
a shared colour and texture finish is `layer-video-looks`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Job                       | Route                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Logo reveal               | `image_to_video`, exact logo as `last_frame`, an abstract or empty plate as `first_frame` |
| Idle logo loop            | `image_to_video`, the logo as both `first_frame` and `last_frame`, `loop` capability      |
| Title, lower third, CTA   | Timeline `text` item with `font_file_id`, never a prompt                                  |
| Text entering or leaving  | A transition between items: `slide`, `wipe`, `iris`, `clockWipe`, `flip`, `fade`          |
| Word-by-word kinetic type | Consecutive `text` items, one word or phrase each, stepped on `start_frame`               |
| Shaped reveal of an image | `mask` on an `image` or `video` item: `circle`, `ellipse-horizontal`, `ellipse-vertical`  |
| Plate behind type         | A `solid` item under the text, or the text item's own `background_color`                  |

## Reveals and loops: generate the picture, pin the frame

A reveal is judged on its last frame, which is the one the viewer reads. Filter `list_base_models`
with `filter.use_case: "image_to_video"` and `filter.guidance_file_types: ["first_frame",
"last_frame"]`, take the first result, and `get_base_model` for its durations and trigger word. Pass
the exact logo file as `last_frame`, so the landing frame is the artwork rather than the model's
memory of it. `first_frame` is what the reveal grows from: an empty plate in the brand colour, an
abstract shape, or particles, from an existing still or one `text_to_image` run (`layer-image`), sized
with `width` and `height` to the reveal's frame. Describe only the transition in the prompt ("gold shards converge and
lock into the emblem, light sweep across it at the end"), never the logo's letters.

`render_video_timeline` takes `{workspace_id, template, videos, images, audios}`. `template` is
`{width, height, fps, tracks: [{id, name, items, transitions}]}`; an item is `{id, type, start_frame,
duration_in_frames}` plus `file_id` or `slot`, and optionally `layout {left, top, width, height}`,
`effects`, `start_from_in_seconds` to trim a clip's head, and `volume`; a `solid` takes `color`
`{red, green, blue, alpha}`. The render returns a `generation_id` for `get_generation_run`.

An idle loop takes the logo as both `first_frame` and `last_frame`, and a model with the `loop`
capability where the clip must repeat without a jump. Keep its motion small (a breathing glow, a
slow rim light) so the mark never leaves its own silhouette.

Set `duration_seconds` on a model filtered with `fixed_duration: true` when the sting must land on a
beat. Estimate with `estimate_forge_price` using the same files, then execute and poll `get_forge_run`
at `poll_interval_seconds`.

## Type: set it, then move it with cuts

A timeline `text` item takes `text`, `font_file_id` (an uploaded .ttf or .otf; upload local fonts with
`request_file_upload_url`) or `font_family`, `font_size`, `font_weight`, `letter_spacing`,
`line_height`, `text_align`, `color`, `stroke` (`{color, width}`), `shadow` (`{color, x, y, blur}`),
`background_color`, and a `layout` box `{left, top, width, height}` in composition pixels.

The timeline has **no keyframes**. An item's position, opacity and effects hold for its whole span.
Motion comes from two sources only:

- **Transitions** on a track's `transitions`, each `{id, type, from_item_id, to_item_id,
duration_in_frames, easing}`, with `direction` (`from-left`, `from-right`, `from-top`,
  `from-bottom`) on `slide`, `wipe` and `flip`. `easing: "spring"` gives the overshoot that reads as
  designed motion; `ease-out` suits an entrance, `ease-in` an exit. A transition joins two adjacent
  items on one track, so a title that slides in needs a `solid` or empty-looking item before it.
- **Stepped items.** Kinetic type is a run of `text` items on one track, each one word or phrase, back
  to back on `start_frame` with no overlap. Hard cuts on the beat read as rhythm; a short `fade` or
  `wipe` between them reads as flow.

Anything that must glide continuously (a slow push on the title, a sweep of light across the type) is
a generated clip of the type rendered as an image, not a timeline effect: `render_text` the line,
then animate that still with `image_to_video` as both frames and a "light sweep only, letters
unchanged" prompt, and check every frame for warping. Report the gap rather than promising a
keyframe move.

## Reading time and placement

Hold a title at least as long as it takes to read twice aloud, and convert that to frames at the
template's `fps`. A lower third holds for the whole time its speaker is on screen. Keep type
and logos well inside the frame edges, since social players overlay their own UI top and bottom;
check the platform's current safe-area spec rather than guessing a margin. Tracks composite in
reverse order: Track 1 is on top, so type goes on the first track and plates below it.

## Worked example

"A 4-second logo sting for our trailer, then a lower third naming the studio."

1. The logo PNG and the brand font are on the user's machine: upload both with
   `request_file_upload_url`.
2. `list_base_models` with `filter.use_case: "image_to_video"`,
   `filter.guidance_file_types: ["first_frame", "last_frame"]` and
   `filter.capabilities: {fixed_duration: true}`. Take the first result; `get_base_model` for its
   durations.
3. `estimate_forge_price` with a dark brand-colour plate as `first_frame`, the logo as `last_frame`,
   `duration_seconds: 4`, and the prompt "embers drift inward and fuse into the emblem, a single
   light sweep across it in the last half second, camera locked". Above 20 CUs, ask first.
4. `execute_forge`, poll `get_forge_run`, and step to the last frame of each output against the logo
   file. Reject any that changed the mark.
5. Timeline at 30 fps: Track 1 holds a `solid` (8 frames) then a `text` item "Studio Name" in
   the brand font, joined by a `slide` transition `direction: "from-left"`, `easing: "spring"`,
   `duration_in_frames: 12`. Track 2 holds the sting video item.
6. `estimate_video_timeline_price` with that template; then `render_video_timeline` with the same
   arguments and poll `get_generation_run`. Watch it end to end.

## Common mistakes

- Prompting the logo's name or letters into a video model instead of pinning the logo as `last_frame`.
- Generating titles, lower thirds or CTA copy as video rather than setting them as text items.
- Expecting a keyframe slide or scale on one timeline item; motion is transitions or stepped items.
- A transition with only one item on the track, so there is nothing to transition from.
- Overlapping items on one track instead of stacking them on separate tracks.
- Titles cut before they can be read twice, or set outside the platform's safe area.
- A logo loop with motion big enough to break the mark's silhouette.
