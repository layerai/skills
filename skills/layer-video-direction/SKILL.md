---
name: layer-video-direction
description: "Use when directing a single generated shot on Layer: choosing the camera move, lens, framing, lighting and pacing, applying a camera preset such as a dolly zoom or orbit, or timing a performance to the clip length. Also when a shot drifts, moves the wrong way, or feels flat or rushed. Keywords: cinematography, camera move, dolly, orbit, crane, tilt, FPV, handheld, lens, framing, lighting, shot language, technique preset."
license: MIT
---

# Layer Video Direction

## Overview

One shot, directed well. A generated shot goes wrong in predictable ways: the camera drifts when it
should hold, two moves fight each other, the action is crammed into the first second or spread so
thin nothing happens. Direction is choosing, before generating, what the camera does, what the
subject does, and how long each takes.

The generation loop and the spend gate are in the `layer` skill; anchoring on a still, loops and
drafts are in `layer-video`. Holding a character and set across several shots is
`layer-video-continuity`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Want                                     | Route                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| A standard camera move                   | `video_effects: [{type, weight}]`, where `get_base_model` lists the type              |
| A camera that must not move              | `video_effects: [{type: "STATIC"}]` if offered, and "locked-off camera" in the prompt |
| A named cinematic technique              | `list_reference_sets` with `filter.category`, passed as `reference_sets`              |
| An exact clip length                     | `duration_seconds`, on a model filtered with `capabilities: {fixed_duration: true}`   |
| Models that take structured camera moves | `list_base_models` with `capabilities: {video_effects: true}`                         |

`video_effects` types are uppercase: `GENERAL`, `ORBIT_360`, `DOLLY_IN`, `DOLLY_OUT`, `ZOOM_IN`,
`ZOOM_OUT`, `CRANE_UP`, `CRANE_DOWN`, `TILT_UP`, `TILT_DOWN`, `STATIC`, `FPV_DRONE`, `HYPERLAPSE`,
`HANDHELD`. Support is per model, so read `get_base_model` before choosing one. `weight` runs 0 to
100; leave it unset for the model's default strength and lower it when the move overwhelms the
subject.

## One move per shot

A shot carries one camera idea. A push in while orbiting while tilting reads as a malfunction, and
models handle a single clear move far better than a compound one. If the scene needs two, it is two
shots.

Prefer the structured effect over prose for the same move: the effect is the input the model takes
for it. Where the model offers no effect for the move, describe it in the prompt in camera terms
("slow push in toward her face", "the camera cranes up to reveal the city") and keep the rest of the
prompt about the subject.

Choose the move for what it says, not for energy:

- **Push in (dolly in)**: rising tension, attention narrowing to a detail or a face.
- **Pull out (dolly out)**: reveal of scale or isolation.
- **Orbit**: showcase of a hero, a weapon, a product; it reads as display, not drama.
- **Crane up**: arrival or ending; crane down settles into a scene.
- **Handheld**: urgency and presence; wrong for calm or for anything that has to read precisely.
- **Static**: performance and comedy; lets the action carry the shot.

A dolly zoom (vertigo) is a push in with a counter-zoom, not `DOLLY_IN`; use a `camera_movement`
set for it, or describe both halves in the prompt.

## Lens, framing and light

Name these in the prompt in production terms, once, and keep them across a scene:

- **Framing**: extreme wide, wide, medium, close-up, extreme close-up; eye level, low angle, high
  angle, top down.
- **Lens**: wide-angle for space and distortion near the edges, long lens for compressed depth and a
  soft background.
- **Light**: the key's direction and quality (hard noon sun from the left, soft overcast, low warm
  backlight), and the time of day. A shot with no stated light gets an even, flat default.

## Technique presets

Layer ships technique reference sets that package a camera move, angle, framing, lens, lighting,
composition, atmosphere, genre look, optical or visual effect, timing or performance. Discover them
with `list_reference_sets` and `filter.category` set to one of `camera_movement`, `camera_angle`,
`camera_framing`, `camera_lens`, `scene_lighting`, `scene_composition`, `scene_atmosphere`,
`time_and_motion`, `genre_look`, `optical_effect`, `visual_effect` or `character_performance`; add
`filter.fulltext` for the technique the user named. Pass the chosen set as
`reference_sets: [{set_id}]`. Never hard-code a set: the catalogue differs by workspace.

Read `reference_set_contributions` on the estimate. A camera set attached to an image model comes
back `skipped_irrelevant_category`, and any set can be degraded on a model that cannot apply it.
When `reference_sets_degraded` is true, say which set did not apply and why; never report it as
applied.

## Pacing to the clip

Clips are short, so time the action to the length. Say when things happen: "holds still for the
first second, then turns sharply toward the camera, and the rest of the clip is the reaction".
Without timing the model spreads the action evenly, which reads as slow motion, or front-loads it and
leaves dead frames.

Set `duration_seconds` from the beat, not the maximum. Filter for `fixed_duration` when the length
matters; models without it choose their own length and ignore the request without an error.

For a performance, give the beat a cause and a reaction: "she hears the door, freezes, then slowly
turns". Emotion words alone ("she looks scared") produce a held expression, not a performance.

## Worked example

"A 5-second hero shot of our mech for the trailer: slow, imposing, a dolly zoom feel."

1. The approved mech still has a `file_id`. No upload.
2. `list_base_models` with `filter.use_case: "image_to_video"` and
   `filter.capabilities: {fixed_duration: true}`. Take the first result; `get_base_model` for its
   `video_effects` types and durations.
3. `list_reference_sets` with `filter.category: "camera_movement"` and `filter.fulltext` for the
   technique the user named. Show the user the match before using it.
4. Prompt: "Low angle, wide lens. The mech stands still for the first second, then its head turns
   slowly toward the camera and its visor lights up. Hard low backlight, dust in the air."
5. `estimate_forge_price` with the still as `{file_id, type: "first_frame"}`,
   `duration_seconds: 5`, and `reference_sets: [{set_id}]`. Read the contribution report: if the set
   is degraded on this model, re-estimate without `base_model_id` so the server picks one that applies
   it, or fall back to the closest `video_effects` type. Above 20 CUs, ask and wait for an explicit
   yes.
6. Execute, poll `get_forge_run` at `poll_interval_seconds`, and report whether the set applied.

## Common mistakes

- Two or three camera moves in one shot.
- Describing a move in prose when the model takes it as a `video_effects` type.
- Passing `video_effects` as a list of strings instead of `{type, weight}` objects.
- Leaving the camera unstated and accepting the drift the model adds.
- Hard-coding a technique set id or name from another workspace.
- Reporting a technique set as applied without reading the contribution report.
- Emotion words instead of a timed beat.
- Asking for an exact length on a model without `fixed_duration`.
