---
name: layer-video-continuity
description: "Use when a Layer video has more than one shot and they must cut together: a trailer, ad, cutscene or short story where the same character, set and motion carry across cuts. Also when a character changes face or costume between shots, when shot two does not start where shot one ended, or when drafting a whole sequence before paying for finals. Keywords: multi-shot, continuity, sequence, shot list, character reference, elements, next shot, Seedance, cutscene."
license: MIT
---

# Layer Video Continuity

## Overview

A single shot holds its own continuity. A sequence does not: every generation re-invents the face,
the costume, the light and the set unless something carries them across the cut. This skill is about
what carries them. Single-shot motion and camera are `layer-video` and `layer-video-direction`;
cutting the finished shots together is `layer-video-timeline`; the storyboard comes from
`layer-art-direction`.

Three things carry continuity, strongest first:

1. **The last frame of the previous shot** as the first frame of the next.
2. **Character elements**: reference images or a clip of the character, attached to every shot.
3. **One approved still** that every shot is drawn from.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Need                                 | Route                                                                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| Shot N+1 starts where shot N ended   | Shot N's video `file_id` in the `first_frame` slot with `video_frame: "last"`                 |
| A frame at an exact time             | `video_frame_seconds` on the same guidance entry; it overrides `video_frame`                  |
| Same character in every shot         | `element_frontal_image`, `element_reference_image` or `element_video` guidance files          |
| Match the motion of an existing clip | `reference_video`                                                                             |
| Models that accept all of the above  | `list_base_models` with `filter.guidance_file_types` listing every type the sequence will use |
| What a slot accepts, and its limits  | `get_base_model` on the chosen model                                                          |
| Explore the whole sequence cheaply   | `draft: true` on every shot, complete only the keepers                                        |

A guidance entry is `{file_id, type}` plus optional `video_frame`, `video_frame_seconds` and
`weight`. A video placed in an image slot (`first_frame`, `last_frame`, `reference_image`,
`init_image`) contributes one frame: its first frame by default, its last for `last_frame`. So to
start a shot on the previous shot's ending you must say so: `video_frame: "last"`.

## Pick a model by what it accepts

Continuity is a capability question before it is a prompt question. Ask `list_base_models` for
`filter.use_case: "image_to_video"` and `filter.guidance_file_types` set to every slot the sequence
needs, for example `["first_frame", "element_frontal_image"]`. Every listed type must be accepted,
so an empty result means the combination is too ambitious: drop the least important slot rather than
inventing a model. Families such as Seedance, Kling or Veo differ in what they take, which is why the
filter, not the family name, decides.

Then `get_base_model` on the first result. It gives each slot's file and length limits and the
family's own prompt guide, which is the right phrasing for that model. Use one model for the whole
sequence: two families render the same element differently, and the cut shows it.

## Elements hold the character

Attach the same element files to every shot that shows the character, unchanged. Use a frontal image for the face, reference images
for the costume from other sides, and an element video where the model accepts one. Produce these once from the approved design (`layer-game-assets` for a
character sheet) and reuse their `file_id` values: never regenerate an element mid-sequence.

Elements hold identity, not position. The prompt still states where the character is, what they do
and which way they face.

## Write the sequence as a shot list

From the storyboard, write one line per shot before generating anything:

- **One action per shot.** A shot that has to show a door opening, a reaction and a sword draw will
  do none of them well. Split it.
- **Screen direction.** If the hero exits frame right, they enter the next shot from frame left.
  State it in both prompts.
- **Eyeline and light.** Name the light direction once and repeat it verbatim in every shot of the
  scene.
- **Cut type.** A continuous action chains on the last frame. A cut to a new angle does not chain:
  start it from the approved still or the elements, or the new angle inherits the old composition.

## Draft the whole sequence first

Where `get_base_model` reports `capabilities.draft`, render every shot with `draft: true`, review the
sequence as a cut, then complete only the shots you keep. A completion is a second `execute_forge`
with `base_model_id` set to the draft's `draft.completion_base_model_id`, `batch_size: 1`, and the
draft's `file_id` as a guidance file of type `draft.completion_guidance_type`, with no prompt: it
keeps the draft's prompt, motion and length. Estimate a completion with the completion model and the
draft's `duration_seconds`. Drafts can expire (`draft.status`, `expires_at`), so complete promptly.

Chaining drafts previews the cut cheaply, but a completion re-renders the whole shot, so its last
frame can drift from the draft's and the join shifts. When a join must be exact, complete shot N first
and generate shot N+1 from the completed take; say this costs a second run of each chained shot.
Set length with `duration_seconds`.

## Worked example

"A 4-shot cutscene: our knight walks to the gate, pushes it open, a dragon looks up, the knight draws
her sword."

1. The approved knight design and front view already have `file_id` values. No upload.
2. `list_base_models` with `filter.use_case: "image_to_video"` and
   `filter.guidance_file_types: ["first_frame", "element_frontal_image", "element_reference_image"]`.
   Take the first result; `get_base_model` for slot limits, durations, `capabilities.draft` and the
   prompt guide.
3. Shot list: (1) wide, knight walks left to right toward the gate; (2) continuous, she pushes it
   open, chained; (3) new angle, the dragon lifts its head, from an approved dragon still, no knight
   elements; (4) medium, knight draws sword, facing right, elements attached.
4. Price the job: one estimate per kind (a shot with elements, a chained shot, the dragon shot), then
   the four completions at the drafts' durations. Present the total; above 20 CUs wait for an
   explicit yes.
5. Draft all four, each with the knight elements as `{file_id, type: "element_frontal_image"}` and
   `{file_id, type: "element_reference_image"}`. Shot 2 adds
   `{file_id: <shot 1 video>, type: "first_frame", video_frame: "last"}`.
6. Poll each at `poll_interval_seconds`. Review the four as a sequence, redraft any shot that breaks
   screen direction, then complete the keepers and re-chain shot 2 from the completed shot 1.
7. Hand the completed `file_id` values to `layer-video-timeline` for the cut.

## Common mistakes

- Putting the previous clip in `first_frame` without `video_frame: "last"`, so the shot restarts at
  the beginning of the last one.
- Choosing the model by family name instead of by `guidance_file_types`.
- Changing models partway through a sequence.
- Regenerating the character's element images between shots.
- Chaining across a cut to a new angle, so the new shot inherits the old composition.
- Packing several actions into one shot.
- Paying for full-quality takes before the sequence has been reviewed as drafts.
- Chaining from a draft when the join must be exact.
