---
name: layer-tilesets
description: "Use when making game tiles with Layer that must snap together on a grid: isometric tiles, hex tiles, diamond or top-down map tiles, buildings and props with a footprint, the same building from four facings, or a tileset for Tiled, Godot or Unity. Also when generated tiles do not line up, stand at different heights, or light from opposite sides. Keywords: isometric, iso, hex, hexagon, tileset, tile map, dimetric, footprint, facing, Tiled, TileSet, strategy map, city builder."
license: MIT
---

# Layer Tilesets

## Overview

A tile is only useful next to its neighbours. Two beautiful isometric houses drawn at slightly
different angles, or standing on slightly different bases, will not sit on one map, and no prompt
wording fixes that. Layer solves it with structure rather than description: `tile_grid` on
`execute_forge` draws each tile over a blockout of a fixed grid, then cuts it out and fits it onto
that grid, so every tile in a set shares one projection and footprint.

This skill covers tiles that stand on a grid (isometric diamonds, hexes, aligned top-down cells).
A flat surface that repeats edge to edge, such as grass or stone, is a texture: use `tileability`
as `layer-textures` describes. Generation mechanics, the spend gate and polling are in `layer`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Need                               | Use                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| A model that draws onto the grid   | `list_base_models` with `filter.capabilities: {tile_grid: true}`, first hit                      |
| Isometric diamond tile             | `tile_grid.shape: "SQUARE"` (default), orientation `DIAMOND` (default)                           |
| Top-down square map                | `shape: "SQUARE"`, `orientation: "ALIGNED"`                                                      |
| Hex tile                           | `shape: "HEXAGON"`, `orientation: "POINTY_TOP"` (default) or `"FLAT_TOP"`                        |
| Classic 2:1 isometric look         | `elevation` unset: 30 (2:1 dimetric) on a square, set at most 60; unset on a hex is 60           |
| Ground tile vs building            | `height: 0` for flat ground, about 1 to 2 (in cell sides) for a building                         |
| Multi-cell building                | `footprint_width` x `footprint_depth`, 1 to 8 cells each; leave unset on a hex, which covers one |
| Other sides of one building        | `facing` 0, 90, 180, 270 (squares only; a hexagon faces 0)                                       |
| Delivered cell size                | `tile_width` in px; unset keeps the drawn size rounded to a power of two                         |
| Redraw an existing asset as a tile | Attach it as `init_image`: its shape and design are kept                                         |
| Carry the set's look, or a facing  | Attach approved tiles as `reference_image`                                                       |
| Tiles on one fixed canvas          | `output_fit` with `canvas: "FIXED"` and `anchor: "BASE"`                                         |
| Engine import                      | `export_tileset` with `engine` `TILED`, `GODOT`, `UNITY` or `JSON`                               |

## Fix the grid once

The grid is the contract of the set. Every tile shares one `tile_grid`; only the footprint, height
and facing change from tile to tile. Decide `shape`, `orientation`, `elevation`,
`light_from` and `tile_width` before the first run, write them down, and pass the identical values on
every later run. Changing `elevation` or `tile_width` halfway gives tiles that refuse to line up;
changing `light_from` gives a map whose shadows fall both ways.

`light_from` (`left` or `right`, seen from the camera) is easy to forget because it has a default.
Name it anyway, and keep the prompt's lighting words consistent with it.

## What the prompt carries

The grid handles projection and placement, so the prompt spends its words on the subject and the
set's grammar: material, palette, era, level of detail, and outline treatment. Describe only what
stands on the tile. Scenery beyond the cell, a horizon, or neighbouring buildings fight the cut-out.

Approve one tile, then attach it as `reference_image` on every sibling so they inherit its palette
and rendering. For a set that will grow for months, train a reference set (`layer-reference-sets`).

## Facings

A building seen from four sides is four runs with `facing` 0, 90, 180 and 270. Generate facing 0
first and approve it. Then run the other three with the approved tile attached as `reference_image`,
which carries "the same building for another facing". Without it you get four different buildings
that happen to share a footprint. Facings exist for square cells only.

`export_tileset` names facings of one subject after it (`tower_0`, `tower_90`) and records subject
and facing as tile properties.

## Delivery

`export_tileset` is the finish for a map: a deterministic file operation, no Creative Units, each
tile placed by where it stands on its grid. Pass up to 128 `file_ids` in listing order; every tile
must share one grid.

| `engine` | What the zip holds                                                   |
| -------- | -------------------------------------------------------------------- |
| `TILED`  | A `.tsx` tileset, one image per tile, and an example `.tmx` map      |
| `GODOT`  | A Godot 4 TileSet `.tres` over one atlas                             |
| `UNITY`  | One atlas and the `.meta` that slices it into pivoted sprites        |
| `JSON`   | One atlas and a TexturePacker JSON (hash), for PixiJS, Phaser, Cocos |

The zip carries a README with import steps and the grid settings the map needs. `padding` sets the
transparent gutter on an atlas and is ignored for `TILED`.

When the user wants a single sheet image rather than an engine import, use `pack_sprite_sheet`: with
every frame a `tile_grid` tile, it aligns frames on their anchor (the bottom centre of the cell the
tile stands on), ignores `cell_width` and `cell_height`, and returns each frame's rect and Unity
pivot. For tiles delivered as standalone sprites of one size, `output_fit` with a `FIXED` canvas and
`anchor: "BASE"` stands every tile's base on the same point. `BASE` without `tile_grid` is refused.

## Worked example

"An isometric medieval village tileset for Godot: grass, dirt road and water ground tiles, a 2x2
house from all four sides, and a 1x1 watchtower."

1. `list_base_models` with `filter.use_case: "text_to_image"` and
   `filter.capabilities: {tile_grid: true}`; take the first result, then `get_base_model` for any
   trigger word.
2. Fix the grid for the whole set:
   `{shape: "SQUARE", orientation: "DIAMOND", light_from: "left", tile_width: 128}`, with
   `elevation` unset for 2:1 dimetric.
3. Grass first, `height: 0`, `footprint_width: 1`, `footprint_depth: 1`, prompt naming material,
   palette and outline only: "Grass ground tile, hand-painted, muted greens, soft dark outline".
   Approve one; it becomes the `reference_image` for every later run.
4. Road and water: same grid, `height: 0`, the approved grass attached.
5. House facing 0: `footprint_width: 2`, `footprint_depth: 2`, `height: 1.5`. Approve it, then
   facings 90, 180 and 270, each with the approved house attached as `reference_image`.
6. Watchtower: 1x1, `height: 2`, the grass attached for the look.
7. Before step 3, price the job: `estimate_forge_price` for one call of each kind that can price
   apart (ground tile, house, tower), sum by count, and ask the user above 20 CUs. Execute each run
   and poll `get_forge_run` at the returned `poll_interval_seconds`.
8. `export_tileset` with `engine: "GODOT"` and the approved `file_ids` in listing order. Hand over
   the download link and point at the README's grid settings.

## Common mistakes

- Writing "isometric" in the prompt of a model run without `tile_grid`, and expecting tiles to snap.
- Changing `elevation`, `tile_width`, `orientation` or `light_from` partway through a set.
- Generating facings 90 to 270 without the approved facing 0 attached as `reference_image`.
- Setting `facing` on a hexagon, which only faces 0.
- Prompting scenery around the tile: horizon, neighbours, ground that runs past the cell.
- Using `tile_grid` for a flat repeating surface, or `tileability` for a tile that stands on a grid.
- Handing over a packed sheet when the user asked for something the engine imports as a tileset.
