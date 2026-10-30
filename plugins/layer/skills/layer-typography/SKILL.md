---
name: layer-typography
description: "Use when exact words must appear on a Layer asset: a title, logo lockup, CTA, button label, price, or caption set in a brand font, or text that must be spelled exactly and stay editable. Also when generated text comes back misspelled, when a brand .ttf or .otf must be used, or when text already in an image must be changed. Keywords: typography, text overlay, brand font, lettering, title card, CTA, label, render text, compose, font file."
license: MIT
---

# Layer Typography

## Overview

Image models misspell words and cannot use a font file. When copy must read exactly or be set in a
brand typeface, do not generate it: set it with `render_text`, then place it on the art with
`compose_image`. The art and the type stay separate files, so a copy change is a re-render, not a
regeneration, and the same art can carry every language (`layer-localization`).

Both tools are named directly rather than discovered because they are Layer's own deterministic file
operations, not models: no model runs, no Creative Units are spent, and no estimate is needed for
them. The art underneath is still a billed generation and goes through the usual estimate gate in
the `layer` skill.

Not all lettering belongs here. `render_text` sets flat, single-colour type. Lettering that must look
drawn into the scene (a carved sign, a neon tube, a painted title with texture) is a generation, and
`layer-image` covers prompting for it.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Need                                       | Route                                                                |
| ------------------------------------------ | -------------------------------------------------------------------- |
| Exact copy, brand font, editable later     | `render_text`, then `compose_image` over the art                     |
| Lettering that is part of the illustration | A generation (`layer-image`)                                         |
| Change words already baked into an image   | `list_base_models` with `filter.use_case: "edit_text"`               |
| Brand font on the user's disk              | `request_file_upload_url`, then pass the `file_id` as `font_file_id` |
| Brand font at a public URL                 | `upload_file`                                                        |
| No font file                               | `font_family`: a standard font or a Google Fonts family name         |

## Setting the type

Upload the brand font before anything else. A `font_file_id` takes precedence over `font_family`, and
`font_weight` (100 to 900 in steps of 100, 400 regular, 700 bold) picks the face inside that file,
with `italic` for the italic face. Without a file, `font_family` falls back to a named family, which
is a different typeface from the brand's even when it looks close. Tell the user when that happens.

Size the canvas (`width`, `height`, at most 4096 each) to roughly the box the text will fill in the
final image, so it is barely scaled when placed. Text set small and scaled up goes soft; text set
huge and scaled down loses its weight.

Text that does not fit is refused with the size it needs. Read that size and decide: a bigger box,
a smaller `font_size`, or shorter copy. Do not shrink the font silently until it fits, because a
title that fits by being tiny has failed.

Two alignments do different jobs. `horizontal_alignment` and `vertical_alignment` place the block on
the canvas; `text_align` aligns the lines of a multi-line block with each other. A newline starts a
new line and long lines wrap at spaces. `line_height` only loosens spacing.

The canvas is transparent unless `background_color` is set. `#RRGGBBAA` gives a translucent plate
behind the words, which is the simplest contrast fix over busy art.

Flat single-colour type has no outline or shadow. For a drop shadow, render the same text twice, once
in a dark colour and once in the face colour, and stack them in `compose_image` with the dark copy
offset a few pixels down and right.

## Placing it

`compose_image` stacks up to 16 layers into one flat PNG, bottom first. The canvas defaults to the
first layer's image size, so put the art first and the canvas matches it.

- **Anchors** are pixel offsets from the canvas edges. Set `left` and `right` together and the box
  spans between them. To pin text to a corner or centre it without knowing its size, anchor all four
  sides at the margin and set `horizontal_alignment` and `vertical_alignment`. `width` and `height`
  sit on the layer beside `anchors`, never inside it.
- **`resize_strategy`**: `fit_and_pad` for text and logos, so they scale into the box without
  distortion. `fit_and_crop` is for full-bleed backgrounds. Never `stretch` type.
- **Rotation** turns a layer 90, 180 or 270 degrees: vertical spine text, or a card's index set
  upside down in the opposite corner.

## Legibility

- Judge the composite at the size it will be seen, not at full resolution. A store icon label or a
  mobile button is read at a fraction of the canvas.
- Plan the space when the art is generated: ask for a calm, low-detail area where the title will sit.
  Text over the busiest part of the frame needs a plate, and a plate is a compromise.
- Keep a safe margin from every edge. Platforms crop and overlay their own UI, and a CTA against the
  edge is the first thing lost.
- One typeface, with weight and size for hierarchy, reads as designed. Three reads as a ransom note.

## Changing text already in an image

When the words are baked into existing art, filter `list_base_models` for `use_case: "edit_text"`,
take the first result, and quote the exact replacement string in the prompt. Check the output letter
by letter. If it misspells twice, remove the old text to a clean plate instead (an `erase_object` or
`inpainting` model), then letter the plate with `render_text` and `compose_image`.

## Worked example

"Put our title 'Ember Vale' in our brand font on this key art, with 'Pre-register now' under it."

1. The key art came from an earlier run, so it has a `file_id` (1920 x 1080). The font is a local
   `.otf`: `request_file_upload_url`, complete the two-step upload, keep the `file_id`.
2. `render_text` for the title: `font_file_id`, `font_weight: 700`, `font_size: 160`, `color:
"#FFF4E0"`, a 1200 x 240 canvas. If it is refused, read the size it needs and widen the canvas.
3. `render_text` the same title in `#1A0F08` for the shadow.
4. `render_text` the CTA: `font_size: 56`, `background_color: "#000000B3"` for a translucent plate,
   a 640 x 112 canvas.
5. `compose_image` with four layers, bottom first: the key art with no anchors; the shadow anchored
   `top: 124`, `left: 364`, width 1200, height 240; the title at `top: 120`, `left: 360` over it;
   the CTA anchored `bottom: 96`, `left: 640`, width 640, height 112, each text layer `fit_and_pad`.
6. View the result at the size the user will deliver it. No step here spent Creative Units, so no
   estimate was needed; say so when reporting.

## Common mistakes

- Rerolling a generation to fix a misspelled word instead of setting the text.
- Substituting a named family for the brand font without telling the user.
- A canvas far from the final text box, so the type is scaled soft or thin.
- Shrinking `font_size` until refused text fits, rather than resizing the box or the copy.
- Expecting an outline, gradient or glow from `render_text`; it sets flat colour only.
- `stretch` on a text layer, which distorts the letterforms.
- Text against the frame edge or over the busiest region of the art.
- Flattening text into the art when the asset will be localised later.
