---
name: layer-motion-templates
description: "Use when one Layer video edit must be rendered many times with different media: an ad template filled per hook, per language, per placement or per character, a reusable intro or end-card template, or a batch of variants from one timeline. Also when a voice-over or clip should set the edit's length, or when a re-render must update an existing board timeline instead of adding a copy. Keywords: video template, slots, variants, batch render, auto length, reusable edit."
license: MIT
---

# Layer Motion Templates

## Overview

A motion template is one `render_video_timeline` template whose media items name a `slot` instead of
a `file_id`. Each render passes the files for those slots, so forty variants share one designed edit:
the same cuts, type, transitions and timing, with only the swapped media changing. That is what keeps
a batch consistent and its results comparable.

Timeline basics are in `layer-video-timeline`, designed motion in `layer-motion-graphics`. The
matrices that decide which variants to make are in `layer-ua-creatives` and `layer-localization`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Need                                | Field                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------- |
| A swappable clip, image or sound    | `slot: "<name>"` on a `video`, `image` or `audio` item, with no `file_id` |
| Fill the slots for one render       | `videos`, `images`, `audios` maps: `{"<slot>": [{file_id}]}`              |
| Let a voice-over or clip set length | `is_auto_length: true` on that one item (at most one per template)        |
| Cap the render                      | `template.max_duration_in_seconds` (up to 120)                            |
| An optional element                 | A slot left unresolved is omitted from the render                         |
| Update the board timeline in place  | `timeline_object_id`, when one is known                                   |
| Price a variant                     | `estimate_video_timeline_price` with everything but `timeline_object_id`  |

`render_video_timeline` takes `{workspace_id, template, videos, images, audios}`. `template` is
`{width, height, fps, tracks: [{id, name, items, transitions}]}`; an item is `{id, type, start_frame,
duration_in_frames}` plus `file_id` or `slot`, and optionally `layout {left, top, width, height}`,
`effects`, `start_from_in_seconds` to trim a clip's head, and `volume`; a `solid` takes `color`
`{red, green, blue, alpha}`. The render returns a `generation_id` for `get_generation_run`.
Slot maps are keyed by slot name: `audios: {voiceover: [{file_id}]}`.

## Designing the template

Decide what varies before building anything. Every element is either **fixed** (brand type, end card,
logo, music bed, transitions) or **slotted** (the hook clip, the voice-over, the gameplay capture,
the character art). Fix everything you can: a template where every item is a slot is just an empty
timeline.

Name slots for their role, not their content: `hook_clip`, `voiceover`, `hero_image`, not
`dragon_v2`. Each slot resolves to a file of the item's own media type, so a `video` item's slot is
filled from `videos`, an `image` item's from `images`, an `audio` item's from `audios`.

Text stays in the template as `text` items. A text item has no slot, so copy that changes per
variant (a translated CTA, a different hook line) is either a separate template per language or an
image slot filled with a `render_text` PNG made per variant (see `layer-typography`). The second keeps
one template; check every rendered PNG before it goes in.

## Length that follows the media

Voice-overs and hook clips differ in length per variant. Set `is_auto_length: true` on the one item
whose media should decide: at render it takes the full length of the file bound to it, and
`duration_in_frames` only sizes it in the editor. Items after the auto-length block move by the change
in length, items ending at its end end with it, and items inside it are cut at its new end. Only one
item per template may set it, and an auto-length slot left without media is removed and the gap
closes. Other video and audio never play past their own file's length, so a music bed shorter than
the longest variant ends early: pick one long enough.

Set `max_duration_in_seconds` to the placement's limit, and check each render's length against it,
so an overlong voice-over does not ship a 40-second cut to a 30-second slot.

## Pricing and rendering a batch

Estimate before the first render, and price the batch as a whole. Variants that differ only in which
files fill the slots, at the same length, share one estimate times their count. A variant whose
auto-length media is longer can price differently: estimate each distinct length. Present the total;
above 20 CUs wait for an explicit yes.

Render each variant with `render_video_timeline`, the same `template`, and that variant's slot maps;
poll each `generation_id` with `get_generation_run` at the returned interval. Pass `session_id` so the
batch lands on one board.

`timeline_object_id` makes a render update an existing board timeline in place rather than placing a
second one. The tool description sources the id from board-timeline tools that MCP does not
expose, so do not try to call them. Pass the id when the user supplies it, otherwise
omit it and say that each render adds a new timeline to the board. Do not try to work around it.

## Worked example

"Our 15-second ad template, filled for three hooks and two voice-overs each."

1. Every hook clip and voice-over came from earlier runs and carries a `file_id`. The logo and font
   are already uploaded.
2. Template at 1080 x 1920, 30 fps, `max_duration_in_seconds: 15`. Track 1: the logo `image` item and
   a `text` CTA over the last 60 frames. Track 2: a `video` item `slot: "hook_clip"`, then the fixed
   end card. Track 3: an `audio` item `slot: "voiceover"` with `is_auto_length: true`. Track 4: the
   music bed, longer than any voice-over.
3. Six variants. The two voice-overs differ in length, so `estimate_video_timeline_price` twice,
   once with each, and multiply each by three. Present the total; above 20 CUs wait for a yes.
4. Six `render_video_timeline` calls with `videos: {"hook_clip": [{file_id}]}` and
   `audios: {"voiceover": [{file_id}]}`, one `session_id`. Poll each with `get_generation_run`.
5. Name and hand back each output against its cell (`hook2-vo1`), and watch one per voice-over end
   to end to confirm the CTA still lands after the shift.

## Common mistakes

- Slotting everything, so the template fixes nothing and variants drift.
- Hard-coding a `file_id` where a slot belongs, then editing the template per variant.
- More than one `is_auto_length` item, or a music bed shorter than the longest auto-length variant.
- Pricing a batch from one variant when the auto-length media differs in length.
- Expecting a slot on a `text` item; varying copy is a `render_text` image slot or its own template.
- Omitting `max_duration_in_seconds` for a placement with a hard length limit.
- Inventing a canvas-timeline call to get `timeline_object_id` instead of reporting the gap.
