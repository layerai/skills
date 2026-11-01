---
name: layer-video-fixes
description: "Use when a generated or supplied clip on Layer is nearly right and should be repaired, not rerolled: extending it, inserting into it, swapping an object or a character, transferring motion, relighting, smoothing motion or making slow motion, upscaling, denoising, deblurring, or converting to HDR. Keywords: fix video, extend clip, swap character, motion transfer, relight, interpolation, slow motion, frame rate, upscale video, denoise, deblur, HDR."
license: MIT
---

# Layer Video Fixes

## Overview

A clip that is 90 percent right is worth more than a fresh roll. Rerolling throws away the motion,
the timing and the performance that already work, and buys a new set of problems. Layer exposes a
use case for most single defects, so the job is to name the defect, pick the use case that fixes only
that, and leave everything else as it was.

Generating a clip from scratch is `layer-video`; cutting finished clips together is
`layer-video-timeline`. The loop, the spend gate and polling are in the `layer` skill.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

Each route is `list_base_models` with `filter.use_case` set as below; take the first result.

| Symptom                                         | `use_case`             |
| ----------------------------------------------- | ---------------------- |
| Clip ends too soon, action is cut off           | `video_extend`         |
| A moment is missing in the middle               | `insert_video`         |
| One element is wrong (colour, prop, background) | `video_editing`        |
| The wrong object is in shot                     | `video_object_swap`    |
| The wrong character, or an off-model one        | `video_character_swap` |
| Right performance, wrong subject                | `motion_transfer`      |
| Lighting fights the scene it is cut into        | `relight_video`        |
| Motion stutters, or the shot needs slow motion  | `video_interpolation`  |
| Too small for delivery                          | `upscaling`            |
| Grain or compression noise                      | `denoise_video`        |
| Soft or motion-blurred                          | `deblur_video`         |
| Standard range master needed as HDR             | `sdr_to_hdr_video`     |

## Read the model before the first call

These models disagree about inputs more than generation models do. The schema does not fix which
guidance slot a repair model reads the source clip from (`init_video` or `reference_video`), nor
where a replacement subject goes (`reference_image`, `face`, or an `element_*` type). Call
`get_base_model` on the chosen model and use the slots it lists; never assume one because another
model took it. When a fix needs two inputs at once, narrow the search with
`filter.guidance_file_types`, for example `["init_video", "reference_image"]`, which keeps only
models that accept both.

Guidance files are `{file_id, type}` objects in `guidance_files`. A clip from an earlier run already
has a `file_id`; pass it directly. Upload only footage that is local, with `request_file_upload_url`.

## Repair from the original

Every pass through a model costs detail. Three fixes chained on each other look worse than three
fixes each made from the source, and the losses compound in faces and fine texture first. Keep the
original `file_id` as the master, apply each fix to the master where the fixes are independent, and
chain only when a later fix genuinely needs the earlier result (upscale last, after the content is
settled, since an upscale of a clip you then edit is wasted).

To fix only part of a clip (slow motion on the last two seconds), cut that span out first with a
`render_video_timeline` edit (`start_from_in_seconds` and `duration_in_frames`, `layer-video-timeline`),
then repair the cut file.

## Sound, length and frame rate

- **Sound.** Set `keep_audio: true` to carry the source's audio through a fix. Without it, assume
  the output may be silent, and check before delivering.
- **Length.** Extensions, inserts and interpolation change a clip's duration, and some swaps do too.
  Report the new length to the user, especially when the clip sits in an edit cut to music. An
  interpolated slow-motion shot is longer by design; a swap that came back shorter is a defect.
- **Frame rate.** `fps` is honoured only by the models that take it (`get_base_model` says so). Ask
  for interpolation to reach a target rate rather than generating at one the model ignores.
- **Size.** For a reframe, pass both `width` and `height`. With either one missing and a source
  attached, the output geometry is taken from the source file.

For an upscale, `upscale_ratio` sets the factor (2.0, 4.0). `creativity` and `resemblance` trade
invented detail against fidelity; keep resemblance high on footage with faces or text.

## Pricing

The forge guide prices a video edit by its source's length and an upscale by its source's
dimensions. An estimate without the source attached prices a different run, so pass
`estimate_forge_price` exactly the inputs `execute_forge` will get. Several fixes on clips of
different lengths are several estimates, never the first one multiplied. Sum the job and ask before
spending above 20 CUs.

## Worked example

"The hero's 6-second clip is perfect except the sword turned into a staff halfway through. Also make
it 4K for the trailer."

1. The clip is a previous run's output, so it has a `file_id`. Keep it as the master.
2. Defect one is a wrong object: `list_base_models` with `filter.use_case: "video_object_swap"`.
   Take the first result and call `get_base_model` for its source slot and replacement slot.
3. Defect two is size: `list_base_models` with `filter.use_case: "upscaling"` and
   `filter.modality: "video"`; `get_base_model` for its slot and ratio limits.
4. Price both before running either: `estimate_forge_price` for the swap with the master attached in
   its listed slot, the approved sword still as the replacement, `keep_audio: true`, and a prompt
   naming only the change: "Replace the staff in the hero's right hand with the approved longsword.
   Keep the motion, the timing and everything else unchanged." Then estimate the upscale with
   `upscale_ratio: 2.0` against a 6-second source. Present the total; above 20 CUs wait for a yes.
5. `execute_forge` the swap; poll `get_forge_run` at `poll_interval_seconds`. Check the length is
   still 6 seconds and the sword holds across every frame.
6. Upscale the swap's output (`file_id` from step 5), the one fix that must come last. Poll, then
   report both `file_id` values and any change in length.

## Common mistakes

- Rerolling a clip whose only defect a single use case could fix.
- Assuming the source slot instead of reading it from `get_base_model`.
- Chaining independent fixes off each other instead of each off the master.
- Upscaling first, then editing the upscaled clip.
- Losing the soundtrack by leaving `keep_audio` unset.
- Delivering a fixed clip without saying its length changed.
- Pricing several fixes from one estimate when their sources differ in length or size.
- Prompting a repair with a full scene description instead of only the change.
