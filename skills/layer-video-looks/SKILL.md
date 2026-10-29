---
name: layer-video-looks
description: "Use when giving a Layer video cut one consistent finish: a colour wash in brand colours, a retro CRT or VHS look, film grain and light leaks, a glitch hit on a cut, keying out a green or blue screen, lifting a cut-out logo off the frame, or filling the bars behind a clip. Also when shots in one edit do not match. Keywords: look, grade, filter, tint, duotone, film grain, vignette, scanlines, glitch, chroma key, green screen, drop shadow."
license: MIT
---

# Layer Video Looks

## Overview

A look is the finish that makes separate shots read as one piece. On Layer it lives in the timeline:
every video and image item in `render_video_timeline` takes an `effects` list plus its own `blur`,
`brightness`, `saturation`, `hue` and `opacity` fields. No model runs to apply them, so a look is exact
to repeat; the render is still priced by `estimate_video_timeline_price`.

Assembly itself (sequence, transitions, overlays, audio) is `layer-video-timeline`. This skill covers
the finish on top of it. A look the timeline cannot make, such as relighting a shot or restyling its
content, is a generation: see `layer-video-fixes`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Look                      | Effects, in this order                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Brand wash                | `duotone` with `darkColor` and `lightColor` in brand colours, or `tint` with `amount`      |
| Retro CRT                 | `scanlines`, then `noise`, then a light `chromaticAberration`                              |
| Film                      | `noise` (grain), `vignette`, `lightLeak`                                                   |
| Glitch hit on a cut       | `tvSignalOff` or a strong `chromaticAberration` on a short item at the cut                 |
| Green or blue screen      | `colorKey` first, with `keyColor` set to the screen                                        |
| Cut-out logo or character | `dropShadow` or `outline` on an image that has transparency                                |
| Dreamy highlights         | `glow` with a `threshold` so only the bright parts bloom                                   |
| Plain grade               | Item fields: `brightness`, `saturation`, `hue`; `contrast`, `exposure`, `vibrance` effects |

Every effect is `{type: "<name>", ...params}` with camelCase params, and every param has a default,
so `{type: "vignette"}` alone is valid. Colours are `{red, green, blue, alpha}` objects, 0 to 255.
`blur`, `brightness`, `saturation`, `hue` and `opacity` are item fields, not effects: `brightness` and
`saturation` are multipliers from 0 to 2 (1 unchanged), `hue` rotates -180 to 180 degrees.

`render_video_timeline` takes `{workspace_id, template, videos, images, audios}`. `template` is
`{width, height, fps, tracks: [{id, name, items, transitions}]}`; an item is `{id, type, start_frame,
duration_in_frames}` plus `file_id` or `slot`, and optionally `layout {left, top, width, height}`,
`effects`, `start_from_in_seconds` to trim a clip's head, and `volume`; a `solid` takes `color`
`{red, green, blue, alpha}`. The render returns a `generation_id` for `get_generation_run`.

## Order is the look

Effects apply in list order, each on the result of the one before. Order changes the picture:

- **Key first.** `colorKey` must see the screen's true colour. A `tint` or `exposure` ahead of it
  shifts the green and the key leaves patches behind.
- **Grade before texture.** Put `tint`, `duotone` and `contrast` ahead of `noise` and `scanlines`, so
  the grain sits on top of the colour instead of being recoloured by it.
- **Distortion last.** `wave`, `fisheye` and `zoomBlur` bend whatever reaches them; place them after
  the texture so the scanlines bend with the picture.

## One list, every clip

A look holds only if every clip that shares it carries the same `effects` list with the same params.
Build the list once and copy it onto each item. A second clip with a slightly different `tint`
`amount` reads as a mismatch, which is worse than no look at all.

Grade toward the shots, not away from them. Shots generated at different times differ in exposure and
saturation; level them first with the item's `brightness` and `saturation` fields, then apply the
shared list.

## Params are fixed for the whole item

The timeline has no keyframes. An effect's params hold for the item's whole span: a `shine` with
`progress: 0.5` is a sheen parked in the middle, not one that sweeps across, and `lightLeak`
`progress` is one phase of the leak, held.

Two ways to get movement:

- **Stepped items.** Split the span into several short items of the same file on one track, each with
  `start_from_in_seconds` continuing where the last stopped, and raise `progress` on each. Four to
  six steps read as motion on a short sheen.
- **Generate it.** A sweep that must be smooth is a video generation with the motion in the prompt
  (`layer-video`), not a timeline effect.

The same split confines an effect to a moment: cut the clip into before, hit and after items on one
track, and give only the few-frame hit item `tvSignalOff`. Do not stack the pieces on separate
tracks; items on one track must not overlap in time.

## Keying a screen

`colorKey` defaults to green (`{red: 0, green: 255, blue: 0}`); set `keyColor` to `{red: 0, green:
0, blue: 255}` for a blue screen. Tune in the order the schema gives: raise `similarity` when patches
of the screen remain, lower it when the subject's edges get eaten, and raise `spillSuppression` when a
coloured fringe stays on the subject. `smoothness` softens the keyed edge.

Tracks composite in reverse order, so Track 1 is on top. The keyed clip goes on a track above the
background it should reveal.

## Filling around a contained clip

A 16:9 clip in a 9:16 frame leaves bars. The schema's own fix: put a second copy of the clip on a
lower track with a full-frame `layout`, `is_auto_layout: false`, `content_fit: "cover"`, a high
`blur`, `volume: 0`, and its `brightness` lowered, then show the clip above it with
`content_fit: "contain"`. The frame fills with the clip's own colours instead of black.

## Worked example

"Give these four approved gameplay shots a retro arcade look, and put our presenter, shot on green
screen, over the last one."

1. All five clips came from earlier runs, so each has a `file_id`; nothing is uploaded.
2. Build one list for the gameplay clips:
   `[{type: "contrast", amount: 1.15}, {type: "scanlines", amount: 0.2, spacing: 4},
{type: "noise", amount: 0.12}, {type: "chromaticAberration", amount: 3}]`. Copy it unchanged onto
   all four gameplay items on Track 2.
3. The presenter goes on Track 1, spanning the last shot, with
   `[{type: "colorKey"}, {type: "scanlines", amount: 0.2, spacing: 4}, {type: "noise", amount: 0.12}]`:
   key first, then the same texture so the presenter sits in the same world.
4. A three-frame `tvSignalOff` item at the cut into the last shot, split from the clip as above.
5. `estimate_video_timeline_price` with the full input. Present the table; above 20 CUs wait for an
   explicit yes.
6. `render_video_timeline` with the same input. Poll `get_generation_run` with the returned
   `generation_id` at the interval it gives, never a fixed sleep.
7. Watch it end to end. If green patches remain on the presenter, raise `similarity` a step and
   re-render; if the hair edge is eaten, lower it.

## Common mistakes

- A different effect list, or different params, on clips meant to share a look.
- A `tint` or `exposure` ahead of `colorKey`, so the screen no longer matches the key colour.
- Expecting `shine` or `lightLeak` to move across a clip; params are fixed per item.
- Putting the keyed clip on a lower track than its background.
- `dropShadow` or `outline` on a clip with no transparency; the schema says they work best on cut-outs.
- Glitching a whole clip when the hit belongs on a few frames at the cut.
- Reaching for a generation to recolour footage the timeline can already grade.
- Uploading clips that Layer generated and that already carry a `file_id`.
