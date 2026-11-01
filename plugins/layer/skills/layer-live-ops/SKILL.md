---
name: layer-live-ops
description: "Use when producing content for a live game with Layer: item evolution and upgrade chains, weapon or gear tiers, currency packs and store bundles, character level-ups and skins, seasonal and event reskins, or batches of themed items. Also when tiers stop reading as one item, a reskin loses the silhouette, or an event set drifts off-style. Keywords: live ops, upgrade chain, evolution, tier, rarity, currency, IAP, skin, reskin, seasonal event, battle pass, themed items."
license: MIT
---

# Layer Live Ops

## Overview

Live-ops art is variation on something the player already knows. A tier-three sword has to be
recognisably the tier-one sword, a Halloween skin has to be recognisably the hero, and a currency
pack has to sit on a ladder with its neighbours. The craft is holding identity constant while moving
exactly one thing.

Every technique here drives a new image from an approved one, so the model filter that matters is
`image_editing`: models that take a source image plus references and reproduce the subject.
`style_reference` transfers a look only and will not hold the item. Generation mechanics and the
spend gate are in the `layer` skill; designing the base asset is in `layer-game-assets`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Job                         | Inputs                                                        | Hold constant                    |
| --------------------------- | ------------------------------------------------------------- | -------------------------------- |
| Upgrade or evolution        | Base tier as `reference_image`, previous tier as `init_image` | Silhouette, proportions, palette |
| Currency or bundle ladder   | Smallest pack as `reference_image`                            | Coin or gem design, light, angle |
| Character level-up          | Approved character as `init_image`                            | Face, build, colour identity     |
| Seasonal or event reskin    | Original as `init_image`, theme in the prompt                 | Silhouette and gameplay read     |
| Themed item batch           | Two or three approved items as `reference_image`              | Rendering, outline, palette      |
| A look that runs for months | A trained reference set (`layer-reference-sets`)              | Everything above                 |

## Escalate one axis per tier

A tier that changes material, size, glow, and ornament at once reads as a different item. Decide the
progression before generating and move one axis per step, in a fixed order the player learns:

1. **Material**: wood, iron, steel, gold, crystal.
2. **Ornament**: plain, banded, engraved, gem-set.
3. **Energy**: no glow, faint glow, aura, particles.
4. **Scale or count**: for bundles, a handful, a pile, a bag, a chest.

Write each tier's prompt as the delta: "the same sword, same shape and proportions, blade now steel
with an engraved fuller; everything else unchanged". Rarity colours (common, rare, epic) are usually
a frame or plate the UI adds, so leave them out of the item unless the game paints them on.

## Anchor on two images, not one

Chaining each tier only off the one before it compounds drift; by tier five the sword is a
different sword. Attach the **base tier** as `reference_image` to hold identity, and the **previous
tier** as `init_image` to carry the escalation so far. `init_image` weight defaults to 0.5: raise it
when the shape is wandering, lower it when the new material will not take.

Every approved output already has a `file_id`. Pass it straight in; never re-upload a generated
asset.

## Reskins

A seasonal skin changes surface, not structure. Pass the original as `init_image` and name what
stays as well as what changes: "same character, same pose, same silhouette and proportions; outfit
re-themed for a winter festival in red and white knitwear, fur trim, candy-cane staff in place of the
spear". Gameplay readability outranks the theme: an enemy reskin must still read as that enemy at
gameplay size, and a weapon must keep its outline so the player knows its range.

For an event set of many items, approve two or three first and attach them as references to the
rest, the same way an icon set is extended in `layer-game-assets`. A game that ships an event every
month should train the house style once and apply it, rather than re-anchoring every season.

## One canvas for the whole chain

Items generated separately come back at different sizes and positions, and a store grid or upgrade
screen shows the mismatch. Set `output_fit` on every run of a chain to the same `canvas: "FIXED"`
`width` and `height`, with `anchor: "CENTER"` for icons or `"BOTTOM_CENTER"` for anything that stands,
plus a little `padding`. Every tier then lands at one sprite size.

## Review the chain, then mark it

Judge tiers side by side, never one at a time. `compose_image` lays the chain out in one row for
review at no cost: a canvas as wide as the row, one layer per tier, each with `width`, `height` and
a `left` anchor. Look for the
step where identity broke, reroll that tier, and re-run the ones after it from the fixed one.

When a step is approved, record it: `list_file_lifecycle_statuses` for the workspace's status ids
(workspaces rename them, so match by name), then `set_file_lifecycle_status` with the approved
`file_id` values. Automated scoring against studio rules is `layer-quality`.

## Worked example

"Five upgrade tiers of our wooden shield, for the forge screen."

1. Tier one is the approved shipping shield; it has a `file_id`.
2. `list_base_models` with `filter.use_case: "image_editing"` and
   `filter.capabilities: {image_editing: true}`; take the first result.
3. Plan the axis per step: iron bands, steel face, engraved crest, gold trim with a faint glow.
4. Price the job before the first run: tiers two to five share one input shape (two files, the same
   size), so one estimate times four. Over 20 CUs, ask and wait for an explicit yes.
5. For each tier: tier one as `reference_image`, the previous approved tier as `init_image`, the
   prompt as a one-axis delta, `output_fit: {canvas: "FIXED", width: 512, height: 512, anchor:
"CENTER", padding: 24}`, `batch_size: 2`. Poll at `poll_interval_seconds`, pick one, continue.
6. `compose_image` the five tiers in a row and review them together. Reroll any tier that broke
   identity, then the tiers after it.
7. `set_file_lifecycle_status` the five to the workspace's approved status.

## Common mistakes

- Changing material, glow, and ornament in the same tier.
- Chaining each tier only off the previous one, so identity drifts.
- `style_reference` instead of an `image_editing` model, so the item itself is not held.
- A reskin that changes the silhouette, so players misread the enemy or weapon.
- Tiers at different sizes and positions because `output_fit` was left off.
- Reviewing tiers one at a time instead of as a chain.
- Re-uploading approved outputs that already have a `file_id`.
