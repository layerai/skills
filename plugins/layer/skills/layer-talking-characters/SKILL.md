---
name: layer-talking-characters
description: "Use when a character or presenter on Layer has to speak on camera: a talking-head presenter, a UGC-style ad, a character delivering dialogue in a cutscene or trailer, or lip-syncing existing footage to a new line. Also when the mouth drifts out of sync, a line overruns the clip, or a voice changes between shots. Keywords: lip sync, lipsync, talking head, presenter, UGC, spokesperson, dialogue, voice over, avatar, talking character."
license: MIT
---

# Layer Talking Characters

## Overview

A talking clip is two assets that must agree: a voice and a face. Make the voice first. The line's
length, pacing and emphasis then decide the clip, and the face is fitted to the audio rather than the
audio squeezed into a clip that was cut too short. Most failed talking clips are a good face on a
line that never fitted it.

Speech craft (scripts, pacing, invented names) is in `layer-audio`; animating a still is in
`layer-video`; assembling shots with captions and an end card is `layer-video-timeline`. The loop and
spend gate are in the `layer` skill.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Starting point                       | Route                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| A script, no audio yet               | `use_case: "text_to_speech"` first                                              |
| An approved still plus the line      | `use_case: "image_to_video_lipsync"`                                            |
| Existing footage plus a new line     | `use_case: "video_lipsync"`                                                     |
| Speech generated with the picture    | `image_to_video` or `text_to_video` with `capabilities: {generate_audio: true}` |
| Any lip-sync model                   | `filter.capabilities: {lipsync: true}` narrows to them                          |
| Music or ambience under the dialogue | `layer-audio`, then mix in `layer-video-timeline`                               |

## The voice

Filter `list_base_models` for `use_case: "text_to_speech"`. The spoken line goes in `prompt`, which is
why speech prices by prompt length. Read `get_base_model` for what the model takes:

- `speech_language`, as one of its `speech_languages` codes, whenever a name or a short line could
  be read in the wrong language.
- `style_instructions` for delivery ("warm, unhurried, a smile in the voice") on the models that
  take it; it is free text, separate from the spoken line.
- `stability`, `similarity_boost`, `speed` and `style_exaggeration` where listed.

Hold one voice per character for the whole project. If the workspace keeps a trained voice as a
reference set, attach it with `reference_sets` and check that `reference_set_contributions` reports
`voice_applied`; when it does not, the line was read by a default voice, so say so. Never present a
degraded set as applied.

Write lines to be heard: short sentences, real punctuation for pauses, numbers and names spelled the
way they are said. A presenter's line runs at speaking pace, so before generating, check the line
against the clip lengths the lip-sync model accepts (`get_base_model`). A line longer than the
longest clip is two shots, not a faster read.

## The face

Lip sync works on what it can see. Frame for it:

- Face visible and near-frontal, mouth unobstructed: no hand, microphone, mask or hair across it.
- Head and shoulders or a medium close-up. A full-body wide shot leaves the mouth a few pixels tall.
- A neutral, slightly open mouth in the source still, so the model is not fighting a fixed grin.
- Even light on the face. Hard shadow across the mouth reads as jitter.

For `image_to_video_lipsync`, generate or approve the still with `layer-image` first. For
`video_lipsync`, choose footage where the speaker faces camera for the whole stretch being synced.

## Wiring the run

Lip-sync models differ in where they read inputs. The schema does not fix whether the audio goes in
`reference_audio` or `init_audio`, or the picture in `first_frame`, `init_image` or `init_video`.
Read the slots from `get_base_model` and use exactly those, as `guidance_files` entries of
`{file_id, type}`. To keep only models that take a given pair, filter with
`filter.guidance_file_types`, such as `["init_video", "reference_audio"]`.

The voice output from the speech run already has a `file_id`; pass it straight in. Upload only
local audio or footage, with `request_file_upload_url`.

The forge guide prices a lipsync by its source's length, so estimate with the real audio and picture
attached. A batch of lines is one estimate per distinct length, summed, and asked about above 20 CUs
before the first run.

## Honesty in ads

A generated presenter is not a customer. Do not script one as a real user's testimonial, give it
invented credentials, or caption it as a review. UGC-style is a format (handheld, direct to camera,
casual), not a claim that the speaker exists. Flag a brief that asks for a fabricated testimonial
before generating, and follow the user's disclosure policy for synthetic people.

## Worked example

"A 10-second UGC-style ad: our presenter says 'I didn't expect a puzzle game to get me this hooked.
Three hundred levels later, still going.'"

1. Flag the honesty point: the line reads as a personal testimonial. Ask whether to frame it as the
   presenter's own voice for the brand, and proceed with the user's answer.
2. `list_base_models` with `filter.use_case: "text_to_speech"`; `get_base_model` for languages and
   delivery fields. Script it clean: "I didn't expect a puzzle game to get me this hooked. Three
   hundred levels later... still going." `style_instructions`, where taken: "casual, amused, fast
   start, slower on the last three words".
3. The presenter still exists (`file_id` from an approved run): medium close-up, facing camera,
   mouth clear.
4. `list_base_models` with `filter.use_case: "image_to_video_lipsync"`; `get_base_model` for its
   slots and longest clip. The line runs about six seconds, so it fits one clip.
5. Estimate the speech run and gate it. The lipsync is priced by audio that does not exist yet, so
   tell the user it will be estimated as a second step. Run speech, poll at `poll_interval_seconds`.
6. Estimate the lipsync with the still and the real audio `file_id` in the slots `get_base_model`
   named; gate it above 20 CUs; execute and poll.
7. Hand the clip to `layer-video-timeline` for captions, the logo and the end card.

## Common mistakes

- Generating the clip first and cutting the line to fit it.
- Guessing the audio slot instead of reading it from `get_base_model`.
- Lip-syncing a wide shot, a profile, or a mouth covered by a hand or prop.
- A new voice on every line of the same character.
- Reporting a voice reference set as applied when `voice_applied` is absent.
- A line longer than the model's longest clip, sped up to fit.
- Scripting a generated presenter as a real customer's testimonial.
