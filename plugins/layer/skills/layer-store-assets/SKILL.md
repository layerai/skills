---
name: layer-store-assets
description: "Use when making store listing art for a game or app with Layer: an app icon and icon variants, a screenshot set with captions, a feature graphic, Steam capsules and header art, or an app preview video. Also when one key art must become every size a store asks for, or a logo or icon stops reading at thumbnail size. Keywords: app icon, store listing, screenshots, App Store, Google Play, Steam capsule, feature graphic, ASO, preview video."
license: MIT
---

# Layer Store Assets

## Overview

Store art is seen small, beside competitors, and briefly. Each asset has one job at its smallest
display size: the icon is recognisable, the capsule shows the logo, the screenshots say
what the player does. An asset judged at full resolution on a large monitor has not been judged.

The second rule is consistency. A listing is a set: icon, capsules, and screenshots must read as the
same game. Derive every size from one approved master instead of generating each one, because each
fresh generation moves the character and shifts the palette.

Store sizes and rules change and differ by store. Take every exact pixel size, and every content
rule, from the user or from the store's current published spec. Do not supply them from memory.

Mechanics and the spend gate are in the `layer` skill, prompt craft in `layer-image`, reframing and
upscaling in `layer-image-editing`, exact type in `layer-typography`, and video assembly in
`layer-video-timeline`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Asset              | Start from                        | Tools                                                  |
| ------------------ | --------------------------------- | ------------------------------------------------------ |
| Icon               | One subject, square, no text      | `text_to_image` with `square`, then `image_editing`    |
| Icon variants      | The approved icon as `init_image` | `image_editing`, one change per variant                |
| Capsule or feature | One wide key art master           | `reframing` to each size, `compose_image` for the logo |
| Screenshot set     | The user's real gameplay captures | `render_text` and `compose_image`, one shared layout   |
| Preview video      | Captured gameplay clips           | `render_video_timeline`                                |
| Size check         | Any finished asset                | `compose_image` downscaled to its display size         |

## Icons

One subject, centred, filling most of the square, against a simple background with strong contrast
to it. The usual subject is the game's hero or its signature object, cropped close. Leave out text,
small props, and fine detail: none of it survives the smallest size the store displays, and type on
an icon reads as noise.

Filter `list_base_models` with `use_case: "text_to_image"` and `capabilities: {square: true}`, adding
`image_editing: true` when the hero must match approved art attached as `reference_image`.

Variants for an icon test start from the approved icon as `init_image` on `use_case:
"image_editing"`, and change one thing each: background colour, expression, or a seasonal prop.
State what stays fixed ("keep the character, pose, framing and outline exactly as they are").
Generate every variant from the approved icon, never from the previous variant, or drift compounds.

## Judge at display size

`compose_image` spends no Creative Units and can shrink anything: a canvas of the display size, one
layer with the asset, both edges anchored at 0, and `resize_strategy: "fit_and_pad"`. Look at that
output. If the hero's silhouette or the logo is unreadable there, the fix is fewer elements and
heavier shapes in the master, not a sharper upscale.

## Capsules, headers, and feature graphics

Approve one master key art wider and larger than the largest target, with the subject composed away
from the area the logo will occupy. Derive each size from it with `use_case: "reframing"`, the master
as `init_image`, and both `width` and `height` set; with either missing and an init image attached,
the output takes the master's shape. If the master is too small for the largest size, upscale it
(`use_case: "upscaling"`) rather than regenerating.

The logo is the user's file, uploaded once with `request_file_upload_url`, never generated: models
degrade lettering. Place it with `compose_image` in a box sized for that capsule using `fit_and_pad`,
key art underneath with `fit_and_crop`. On the smallest capsule the logo is the asset, so give it
most of the frame and check it at display size.

## Screenshot sets

Screenshots show the real game. Use the user's captures, uploaded once, and put generated or
designed art in the frame around them, not in place of them. Check the store's current policy on
what a screenshot may show.

A set reads as a set when every frame shares one layout: the same caption band position and height,
the same font, colour and size, the same background treatment. Fix that layout once and reuse the
same `compose_image` geometry for every frame:

1. A background plate (generated from the key art, or a flat colour) with `fit_and_crop`.
2. The capture in a fixed box with `fit_and_pad`.
3. The caption from `render_text` with the brand font as `font_file_id`, on a canvas the size of
   the caption band, so it is barely scaled when placed.

One caption per frame, a few words, each naming what the player does. Order the set so the first
frames carry the pitch, since they are the ones every visitor sees.

## Preview video

Build it from captured gameplay with `render_video_timeline`: short shots, the core loop in the
opening seconds, captions inside the safe area, and the logo at the end. Whether generated footage
may appear in a preview is store policy; ask before adding any.

## Worked example

"We have key art and a logo. Make our Steam capsules and a small set of icon variants."

1. The key art carries a `file_id`; upload the logo with `request_file_upload_url`.
2. Ask for the exact capsule sizes from the store's current spec, or take them from the user.
3. `list_base_models` with `use_case: "reframing"`; one run per capsule size, key art as
   `init_image`, explicit `width` and `height`.
4. `compose_image` per capsule: reframed art with `fit_and_crop`, logo in its box with
   `fit_and_pad`. Then shrink the smallest capsule to its display size and check the logo reads.
5. Icon variants: `use_case: "image_editing"`, approved icon as `init_image`, three variants that
   change only the background colour.
6. Before step 3, estimate one reframe per distinct size and one icon edit times three, present the
   total, and wait for an explicit yes above 20 CUs. Poll every run at `poll_interval_seconds`.

## Common mistakes

- Judging an icon or a capsule at its generated size instead of its display size.
- Text or fine detail on an icon.
- Generating each capsule size separately instead of reframing one master.
- Passing only `width` or `height` when reframing.
- Generating the logo instead of compositing the user's file.
- Screenshot captions that change position, font, or size from frame to frame.
- Generated scenes presented as gameplay screenshots.
- Pixel sizes or store rules stated from memory.
- Building icon variants from the last variant instead of the approved icon.
