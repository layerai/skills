---
name: layer-ua-creatives
description: "Use when making user acquisition or performance marketing creative for a game with Layer: static ad concepts, hook variants, statics turned into motion, video ads for TikTok, Meta, YouTube or ad networks, end cards and CTAs, or one master resized for every placement. Also when a creative test needs attributable variants. Keywords: UA, user acquisition, ad creative, performance ads, hook, CTA, end card, static to motion, variants, A/B test, placements, 9:16."
license: MIT
---

# Layer UA Creatives

## Overview

A user acquisition creative is a test, not a portrait. It exists to learn which hook, visual, and
call to action bring players in, so the unit of work is a **matrix of variants** that each differ in
one known way, not one beautiful ad. A batch where every image changes the character, the copy, and
the background at once cannot tell the user anything when one of them wins.

Generation mechanics and the spend gate are in the `layer` skill, prompt craft is in `layer-image`,
motion is in `layer-video`, and assembly with end cards is in `layer-video-timeline`. Exact copy on
an image is `layer-typography`. This skill covers how those combine into a creative test.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Step                    | Tool or filter                                                      | Why                                                      |
| ----------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| Anchor the look         | Approved key art as `reference_image`, or the game's reference sets | Every variant must look like the same game               |
| Static concepts         | `use_case: "text_to_image"`, `capabilities: {image_editing: true}`  | Reproduces the game's subjects from the references       |
| One master, many ratios | `use_case: "reframing"`, explicit `width` and `height`              | Extends the frame instead of cropping the subject        |
| Static to motion        | `use_case: "image_to_video"`, the still as `first_frame`            | The approved frame fixes the look; the model adds motion |
| Exact copy              | `render_text`, then `compose_image`                                 | Image models misspell; these spend no Creative Units     |
| End card and CTA        | `render_video_timeline`                                             | Holds the CTA as a designed card, not generated text     |

## Build the matrix before generating

Write the test down as axes before the first run: two to four **hooks** (the opening idea: a near
miss, a power fantasy, a choice the viewer wants to make, a before and after), one or two **visuals**
per hook, and one or two **CTAs**. Give every cell an id such as `H2-V1-C1` and pass it as the file
`name` wherever a tool takes one, so a result in the ad dashboard maps back to exactly what changed.

Change one axis per variant. If the user wants a new character and a new hook, that is two tests.

Show the game as it plays. A creative that promises mechanics the game does not have wins the click
and loses the player after install. When the user has
real gameplay captures, upload them with `request_file_upload_url` and build on them.

## Statics

Anchor every static on the approved key art or the game's trained reference sets, never on prose
alone: rewriting the same description does not reproduce a character. Attach the key art as
`reference_image` on a model filtered for `image_editing`, or pass the game's sets in
`reference_sets` and read `reference_sets_degraded` on the estimate before trusting the batch.

Compose for the thumbnail. A feed shows the ad small and briefly, so one subject, one
action, and high contrast between them beat a detailed scene. Leave clear space where the copy will
go, and say so in the prompt ("empty sky across the top third for a headline").

Keep copy out of the generation. Set the headline with `render_text` on a canvas sized to its box,
then layer it over the art with `compose_image` (art at the bottom with `fit_and_crop`, text above).
Both spend no Creative Units, so copy variants are free.

## One master, every placement

Do not generate each placement separately: the character moves, the palette shifts, and the test
now varies by placement as well. Approve one master, then derive each placement from it with
`use_case: "reframing"` and the master as `init_image`.

Pass both `width` and `height` for every target: with either missing and an init image attached,
the output takes the master's shape. Take exact pixel sizes from the user or the network's current published spec,
not from memory.

## Motion

Static to motion tests whether a winning static works as video. Reframe the static to the video's ratio first, then animate that frame with `image_to_video` and the frame as
`first_frame`. Cropping a finished video to another ratio is where heads go missing.

The hook has to land in the opening seconds, so the motion prompt leads with the action, not with
an establishing move: "the tower topples toward the camera in the first second" rather than "slow
push in on a village, then the tower falls". Clip length and loop behaviour are in `layer-video`.

Assemble shots, logo, music, and a held CTA end card with `render_video_timeline`; the card carries
exact text, never generated lettering.

## Pricing a batch

Price the whole job before the first call. Per `get_forge_instructions`, calls that differ only in
prompt wording or seed share one estimate times their count, but each distinct kind prices apart:
one estimate for the statics, one per reframe target size, one per video length, plus
`estimate_video_timeline_price` for the edit. Sum them; above 20 CUs, show the table and wait for an
explicit yes. Then execute and poll each run at `poll_interval_seconds`.

## Worked example

"Make a creative test for our merge game: three hooks, square and 9:16, plus motion for the best
static."

1. `list_reference_sets` for the game's sets; the approved key art already carries a `file_id`.
2. Matrix: hooks H1 (near miss), H2 (satisfying merge chain), H3 (before and after board), one
   visual each, one CTA. Six statics: three hooks at two ratios.
3. `list_base_models` with `filter.use_case: "text_to_image"` and
   `filter.capabilities: {image_editing: true}`; take the first result. Generate three square masters
   with the key art as `reference_image`, each prompt naming one hook and the empty band for copy.
4. `list_base_models` with `use_case: "reframing"`. Each master becomes `init_image` with
   `width` and `height` set to the user's 9:16 size.
5. `render_text` for the headline and CTA once per ratio; `compose_image` onto each of the six
   frames, named `H1-V1-C1-1x1` and so on.
6. For motion: the user picks one static. Its 9:16 frame goes to `image_to_video` as `first_frame`
   with `duration_seconds` set (filter `fixed_duration: true` so the model honours it),
   then `render_video_timeline` adds the logo and a held CTA card.
7. Before step 3, estimate every kind (statics, reframes, video, timeline), present the total, and
   wait for a yes above 20 CUs.

## Common mistakes

- Variants that change several things at once, so a winner teaches nothing.
- Generating each placement separately instead of reframing one master.
- Passing only `width` or only `height` when reframing, and getting the master's shape back.
- Asking the image model for the headline instead of using `render_text`.
- Cropping a finished video to a new ratio instead of reframing its first frame.
- An opening that establishes before it hooks.
- Depicting gameplay the game does not have.
- Estimating one static and running thirty.
