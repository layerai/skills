# Layer Skills

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Agent Skills for [Layer](https://layer.ai) that teach **creative craft**: how to direct a generation
so the asset that comes back is usable. Sprites that read at 32px, textures that tile without a seam,
a cast that holds its design across a dozen images, a storyboard with one beat per panel.

They drive the [Layer MCP server](https://layer.ai/docs/mcp) and work with Claude Code, Cursor,
Codex, VS Code, and any agent that reads `SKILL.md`.

## Install

```bash
npx skills add layerai/skills --skill "*"
```

`--skill "*"` takes every skill and skips the picker. Running the bare command opens a picker with
nothing preselected, so pressing enter installs nothing.

As a plugin, which also wires up the MCP server. Claude Code, then pick the groups you want:

```bash
/plugin marketplace add layerai/skills
```

Codex, and ChatGPT desktop after a restart:

```bash
codex plugin marketplace add layerai/skills
codex plugin add layer@layer
```

## Prerequisites

These skills call the Layer MCP server at `https://mcp.app.layer.ai/mcp` over streamable HTTP,
authenticated with OAuth. Add it once:

```bash
claude mcp add --transport http Layer https://mcp.app.layer.ai/mcp
```

Other clients, Personal Access Tokens, and troubleshooting are covered in
[Setup](https://layer.ai/docs/mcp/setup).

## How this fits with Layer's published skills

Layer serves six skills from the product itself, discoverable at
[`layer.ai/.well-known/agent-skills/`](https://layer.ai/.well-known/agent-skills/index.json). They
teach **platform mechanics**, REST first: authentication, connecting a client, the request shape,
polling, training, and workspace administration.

This repository is the **craft layer above them**. It does not restate the mechanics; it answers the
questions they leave open. Which model for this task, what the prompt must name, how to hold a
character consistent, why a texture seams. The two are designed to be installed together.

## Skills

<!-- skills:start -->

### Getting started

Connect to Layer and learn the generation loop every other skill builds on: model discovery, the spend gate, uploads, and polling.

| Skill                            | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer`](skills/layer/SKILL.md) | Use when generating or editing game and entertainment assets on Layer through MCP: images, video, 3D meshes, audio, sprites, textures, or marketing creative. Also when choosing a Layer base model, pricing a run in Creative Units before spending them, uploading reference files, polling a generation, applying a trained style, or recovering from MODEL_NOT_FOUND, INSUFFICIENT_BALANCE, RATE_LIMITED, or a silently degraded reference set. |

### Direction

Agree a look before generating at volume: moodboards, storyboards, colour, era, and framing.

| Skill                                                        | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-art-direction`](skills/layer-art-direction/SKILL.md) | Use when a Layer brief needs a direction before generating at volume: exploring a look with a moodboard, choosing between visual directions, storyboarding an ad, trailer or cutscene, pinning a colour palette, naming a style or era precisely, or framing a scene. Also when a brief is vague or generations keep missing an unstated intent. Keywords: art direction, moodboard, style exploration, storyboard, panels, beats, palette, composition, framing, era, reference. |

### Images

Generate stills and change the ones you already have: prompting, sizing, references, masked edits, reframing, upscaling, layers, and exact text in a brand font.

| Skill                                                        | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-image`](skills/layer-image/SKILL.md)                 | Use when generating a still image with Layer: concept art, key art, illustrations, marketing images, icons, or any text-to-image run. Also when a prompt is not landing, when the aspect ratio or resolution is wrong, when a style or pose reference should steer the result, when readable text must appear in the image, or when several images must share one look. Keywords: txt2img, text to image, prompt, aspect ratio, negative prompt, style reference, seed.           |
| [`layer-image-editing`](skills/layer-image-editing/SKILL.md) | Use when changing an image that already exists on Layer rather than generating a new one: editing or replacing part of it, inpainting with a mask, outpainting or extending the frame, reframing to another aspect ratio, relighting, restyling, re-rendering from another camera angle, splitting into layers, removing a background, vectorising, or upscaling. Keywords: img2img, edit, inpaint, outpaint, mask, expand, turnaround, upscale, background removal, PSD, layers. |
| [`layer-typography`](skills/layer-typography/SKILL.md)       | Use when exact words must appear on a Layer asset: a title, logo lockup, CTA, button label, price, or caption set in a brand font, or text that must be spelled exactly and stay editable. Also when generated text comes back misspelled, when a brand .ttf or .otf must be used, or when text already in an image must be changed. Keywords: typography, text overlay, brand font, lettering, title card, CTA, label, render text, compose, font file.                          |

### Game art

Art that has to sit in a system: characters and casts, environments, parallax and skyboxes, isometric and hex tilesets, 9-slice UI and icon sets, pixel sprites, HD sprite animation, VFX, and seamless textures.

| Skill                                                              | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-game-assets`](skills/layer-game-assets/SKILL.md)           | Use when producing in-game characters and props with Layer: heroes, NPCs, enemies, bosses, mascots, creatures, items and props. Also when a cast must stay on-model across many images, when a set of sprites must share one canvas size and ground line, or when a character must be split into parts for a skeletal rig. Keywords: character art, NPC, enemy, mascot, cast, on-model, consistency, prop, item, sprite set, Spine, rigging.                                                          |
| [`layer-environments`](skills/layer-environments/SKILL.md)         | Use when producing game environments with Layer: background and environment concept art, a side-scroller parallax background split into scrolling layers, a 360 skybox or panorama, or a generated world. Also when parallax layers do not line up or loop, when a background is too busy to read gameplay against, or when exporting layers to Godot or Unity. Keywords: environment, background, parallax, layers, side-scroller, platformer, skybox, 360, equirectangular, panorama, world.        |
| [`layer-tilesets`](skills/layer-tilesets/SKILL.md)                 | Use when making game tiles with Layer that must snap together on a grid: isometric tiles, hex tiles, diamond or top-down map tiles, buildings and props with a footprint, the same building from four facings, or a tileset for Tiled, Godot or Unity. Also when generated tiles do not line up, stand at different heights, or light from opposite sides. Keywords: isometric, iso, hex, hexagon, tileset, tile map, dimetric, footprint, facing, Tiled, TileSet, strategy map, city builder.        |
| [`layer-game-ui`](skills/layer-game-ui/SKILL.md)                   | Use when making game UI with Layer: buttons, panels, frames, dialogue boxes, tabs, tooltips, HUD elements, ability and inventory icons, currency symbols, or card and badge plates. Also when a button must stretch to any width without distorting its corners, when a UI kit must import into Unity, Godot or CSS, or when an icon set must read at 64px and match approved icons. Keywords: game UI, 9-slice, nine-slice, UI kit, button, panel, frame, HUD, icon set, NinePatch, border-image.    |
| [`layer-pixel-art`](skills/layer-pixel-art/SKILL.md)               | Use when making pixel art with Layer: sprites, retro game characters, pixel icons, pixel tiles, or a sprite sheet and walk cycle. Also when generated pixel art comes back blurry, anti-aliased, or at the wrong grid size, and when packing separate frames into a sheet or cutting an existing sheet into frames. Keywords: pixel art, sprite, sprite sheet, spritesheet, 16-bit, 32x32, walk cycle, animation frames, palette, dithering, pack, split.                                             |
| [`layer-sprite-animation`](skills/layer-sprite-animation/SKILL.md) | Use when animating a hand-painted, vector-style or HD 2D game character with Layer: idle, walk, run, attack, hit or death cycles, 4-direction or 8-direction sprites for a top-down or isometric game, or a character sprite sheet from a single approved design. Also when frames drift off-model, feet slide, or directions do not match. Keywords: sprite animation, animation cycle, walk cycle, idle, attack, 8-direction, 4-direction, turnaround, sprite sheet, flipbook, top-down, isometric. |
| [`layer-vfx`](skills/layer-vfx/SKILL.md)                           | Use when generating game visual effects with Layer: spell and skill effects, hit impacts, explosions, pickups and power-ups, loot chest and reward openings, auras, portals, or looping ambient effects such as fire, smoke and magic swirls. Also when an effect comes back with a scene around it, cannot be blended in the engine, or plays with no wind-up. Keywords: VFX, FX, spell effect, impact, explosion, particle, flipbook, aura, loot chest, additive, sprite sheet.                     |
| [`layer-textures`](skills/layer-textures/SKILL.md)                 | Use when generating a texture with Layer that must repeat without a visible seam: ground, terrain, walls, fabric, foliage, stone, wood, pattern fills, or a tiling material for a game engine. Also when a generated texture shows seams at its edges, an obvious repeating motif across a surface, or baked-in lighting that fights the engine. Keywords: tileable, seamless, tiling, texture, material, pattern, trim sheet, terrain, repeat.                                                       |

### Video and audio

Generate motion and sound: animating stills, camera and shot language, multi-shot continuity, repairing a clip instead of rerolling it, talking characters and lip sync, sound effects, music, and speech.

| Skill                                                                  | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-video`](skills/layer-video/SKILL.md)                           | Use when generating video with Layer: text-to-video, animating a still image, extending a clip, adding camera motion, generating native audio or lip sync, looping animations, or planning a multi-shot ad, trailer, or cutscene. Also when a video prompt produces the wrong motion or the shot drifts off the source image. Keywords: txt2vid, img2vid, image to video, camera motion, video effects, loop, seamless, trailer, cutscene, lipsync.                           |
| [`layer-video-direction`](skills/layer-video-direction/SKILL.md)       | Use when directing a single generated shot on Layer: choosing the camera move, lens, framing, lighting and pacing, applying a camera preset such as a dolly zoom or orbit, or timing a performance to the clip length. Also when a shot drifts, moves the wrong way, or feels flat or rushed. Keywords: cinematography, camera move, dolly, orbit, crane, tilt, FPV, handheld, lens, framing, lighting, shot language, technique preset.                                      |
| [`layer-video-continuity`](skills/layer-video-continuity/SKILL.md)     | Use when a Layer video has more than one shot and they must cut together: a trailer, ad, cutscene or short story where the same character, set and motion carry across cuts. Also when a character changes face or costume between shots, when shot two does not start where shot one ended, or when drafting a whole sequence before paying for finals. Keywords: multi-shot, continuity, sequence, shot list, character reference, elements, next shot, Seedance, cutscene. |
| [`layer-video-fixes`](skills/layer-video-fixes/SKILL.md)               | Use when a generated or supplied clip on Layer is nearly right and should be repaired, not rerolled: extending it, inserting into it, swapping an object or a character, transferring motion, relighting, smoothing motion or making slow motion, upscaling, denoising, deblurring, or converting to HDR. Keywords: fix video, extend clip, swap character, motion transfer, relight, interpolation, slow motion, frame rate, upscale video, denoise, deblur, HDR.            |
| [`layer-talking-characters`](skills/layer-talking-characters/SKILL.md) | Use when a character or presenter on Layer has to speak on camera: a talking-head presenter, a UGC-style ad, a character delivering dialogue in a cutscene or trailer, or lip-syncing existing footage to a new line. Also when the mouth drifts out of sync, a line overruns the clip, or a voice changes between shots. Keywords: lip sync, lipsync, talking head, presenter, UGC, spokesperson, dialogue, voice over, avatar, talking character.                           |
| [`layer-audio`](skills/layer-audio/SKILL.md)                           | Use when generating audio with Layer: sound effects for a game or trailer, music and background tracks, or speech and voice-over from text. Also when a sound effect comes back with unwanted ambience or reverb, when a music prompt needs structure or length control, or when choosing a voice and delivery for narration. Keywords: SFX, sound effect, foley, UI sound, music, soundtrack, loop, text to speech, TTS, voice over, narration.                              |

### Editing and motion graphics

Finish what you generated: cut shots into one video, give the cut a consistent look, animate logos, titles and end cards in the brand font, and render one template into many variants.

| Skill                                                              | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-video-timeline`](skills/layer-video-timeline/SKILL.md)     | Use when assembling assets a user already has into one finished video with Layer: sequencing clips, adding transitions, overlaying text, captions, a logo or a CTA, layering music or voice-over, or cutting a trailer, ad, or promo from generated shots. Also when a multi-shot piece needs to become a single deliverable file. Keywords: video editor, timeline, assemble, stitch, sequence, concatenate, transitions, overlay, captions, CTA, trailer, montage, render.              |
| [`layer-video-looks`](skills/layer-video-looks/SKILL.md)           | Use when giving a Layer video cut one consistent finish: a colour wash in brand colours, a retro CRT or VHS look, film grain and light leaks, a glitch hit on a cut, keying out a green or blue screen, lifting a cut-out logo off the frame, or filling the bars behind a clip. Also when shots in one edit do not match. Keywords: look, grade, filter, tint, duotone, film grain, vignette, scanlines, glitch, chroma key, green screen, drop shadow.                                  |
| [`layer-motion-graphics`](skills/layer-motion-graphics/SKILL.md)   | Use when making motion graphics with Layer: a logo reveal or sting, an idle logo loop, animated titles, lower thirds, an end card or CTA card, kinetic type, or a branded intro or outro for a trailer or ad. Also when a reveal lands on a distorted logo, when generated lettering comes back misspelled, or when text must move without keyframes. Keywords: motion graphics, logo reveal, logo animation, sting, title card, lower third, end card, kinetic typography, intro, outro. |
| [`layer-motion-templates`](skills/layer-motion-templates/SKILL.md) | Use when one Layer video edit must be rendered many times with different media: an ad template filled per hook, per language, per placement or per character, a reusable intro or end-card template, or a batch of variants from one timeline. Also when a voice-over or clip should set the edit's length, or when a re-render must update an existing board timeline instead of adding a copy. Keywords: video template, slots, variants, batch render, auto length, reusable edit.     |

### 3D

Meshes for a game engine: generation from text or image, remeshing, retexturing, rigging, and animation.

| Skill                                  | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-3d`](skills/layer-3d/SKILL.md) | Use when producing 3D assets with Layer: generating a mesh from text or an image, retopologising or remeshing, retexturing an existing mesh, rigging a character, or animating a rigged mesh. Also when choosing between quad and triangle output, setting a polygon budget, or asking for PBR textures for a game engine. Keywords: 3D, mesh, model, text to 3D, image to 3D, remesh, retopology, retexture, rig, skeleton, animate, PBR, quad mesh, poly count, glTF, FBX. |

### Marketing and live ops

Creative that sells and sustains a game: user-acquisition ad matrices, store listing art, localised assets and dubs, and the upgrade chains and seasonal reskins a live game ships every week.

| Skill                                                      | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-ua-creatives`](skills/layer-ua-creatives/SKILL.md) | Use when making user acquisition or performance marketing creative for a game with Layer: static ad concepts, hook variants, statics turned into motion, video ads for TikTok, Meta, YouTube or ad networks, end cards and CTAs, or one master resized for every placement. Also when a creative test needs attributable variants. Keywords: UA, user acquisition, ad creative, performance ads, hook, CTA, end card, static to motion, variants, A/B test, placements, 9:16.                             |
| [`layer-store-assets`](skills/layer-store-assets/SKILL.md) | Use when making store listing art for a game or app with Layer: an app icon and icon variants, a screenshot set with captions, a feature graphic, Steam capsules and header art, or an app preview video. Also when one key art must become every size a store asks for, or a logo or icon stops reading at thumbnail size. Keywords: app icon, store listing, screenshots, App Store, Google Play, Steam capsule, feature graphic, ASO, preview video.                                                   |
| [`layer-localization`](skills/layer-localization/SKILL.md) | Use when one approved Layer asset must ship in several languages: dubbing a trailer or ad, voice-over in another language, burned-in subtitles or captions per market, or translating text that appears in an image, end card, store screenshot, or UI. Also when a dub drifts out of sync, translated copy no longer fits, or a font shows empty boxes for another script. Keywords: localisation, localization, dubbing, translation, subtitles, captions, voice-over, multilingual, markets, CJK, RTL. |
| [`layer-live-ops`](skills/layer-live-ops/SKILL.md)         | Use when producing content for a live game with Layer: item evolution and upgrade chains, weapon or gear tiers, currency packs and store bundles, character level-ups and skins, seasonal and event reskins, or batches of themed items. Also when tiers stop reading as one item, a reskin loses the silhouette, or an event set drifts off-style. Keywords: live ops, upgrade chain, evolution, tier, rarity, currency, IAP, skin, reskin, seasonal event, battle pass, themed items.                   |

### Consistency and pipelines

Hold one look across a whole project with trained reference sets, run the Blueprint workflows a studio has already built, and import workflows from other tools.

| Skill                                                            | Use when                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-reference-sets`](skills/layer-reference-sets/SKILL.md)   | Use when a look must hold across many Layer generations: training a custom style or LoRA on a studio's own artwork, curating the images that go into a reference set, choosing its training category, tuning reference-set weight on a run, or deciding whether to train at all rather than attach a style reference. Also when a trained style produces weak, inconsistent, or silently ignored results. Keywords: LoRA, custom model, trained style, reference set, consistency, on-model, art direction, dataset. |
| [`layer-workflows`](skills/layer-workflows/SKILL.md)             | Use when running a saved Layer Blueprint workflow rather than a single generation: discovering what workflows a workspace has, reading a workflow's input schema, estimating and executing a run, polling its steps, or cancelling it. Also when a repeatable multi-step pipeline exists for a task, when the user names a workflow, or when a workflow input expects a style or a file. Keywords: workflow, blueprint, pipeline, app, multi-step, run, node graph.                                                  |
| [`layer-workflow-import`](skills/layer-workflow-import/SKILL.md) | Use when bringing a workflow built in another tool into Layer: an exported workflow file, a node-graph JSON from any node editor, a screenshot of a node canvas, or a pipeline described in prose. Also when converting, porting, migrating or rebuilding a pipeline as a Layer Blueprint workflow. Keywords: import workflow, export file, node graph, node editor, convert, port, migrate, rebuild, blueprint.                                                                                                     |

### Review

Judge a batch before it ships: scoring rules, verdicts, and reviewing a set against the brief.

| Skill                                            | Use when                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`layer-quality`](skills/layer-quality/SKILL.md) | Use when judging Layer output before it ships: scoring generated files against a workspace's output scoring rules, reading back verdicts on a file, reviewing a batch against the brief, or choosing which candidate to deliver. Also when a studio has automated quality standards, or a set must be checked for consistency before handoff. Keywords: quality gate, scoring, review, batch, verdict, approve, QA, consistency check. |

<!-- skills:end -->

## Contributing

Read [AGENTS.md](AGENTS.md) first: it is the authoring contract, and it defines the frontmatter
rules, the description format, the word budget, the ban on hard-coded model ids, and the application
test every new skill has to pass. [CONTRIBUTING.md](CONTRIBUTING.md) covers the mechanics.

```bash
task install
task format && task check
```

`task --list` shows every available command.

## License

MIT
