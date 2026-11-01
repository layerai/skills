---
name: layer-localization
description: "Use when one approved Layer asset must ship in several languages: dubbing a trailer or ad, voice-over in another language, burned-in subtitles or captions per market, or translating text that appears in an image, end card, store screenshot, or UI. Also when a dub drifts out of sync, translated copy no longer fits, or a font shows empty boxes for another script. Keywords: localisation, localization, dubbing, translation, subtitles, captions, voice-over, multilingual, markets, CJK, RTL."
license: MIT
---

# Layer Localization

## Overview

Localisation is one master multiplied by a list of languages. Every language version comes from the
approved master, never from another language's version: a German cut made from the French cut carries
the French cut's defects into German.

Layer covers three layers of an asset:

- **Voice**: dub an existing video, or speak a translated script with text to speech.
- **Captions**: burn subtitles into a video.
- **Text in images**: replace words in the art, or letter a clean plate per language.

Generation mechanics, the estimate gate and polling are in the `layer` skill. Setting exact type is
`layer-typography`, and cutting finished videos is `layer-video-timeline`.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Job                                   | Route                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------- |
| Dub a voiced video                    | `use_case: "dub_video"`, `target_language` from the model's `dub_languages` |
| New voice-over from a translated line | `use_case: "text_to_speech"`, `speech_language` from `speech_languages`     |
| Burn in captions                      | `use_case: "video_subtitle"`, `subtitle_preset` from `subtitle_presets`     |
| Change words baked into an image      | `use_case: "edit_text"`                                                     |
| Exact text per language on clean art  | `render_text`, then `compose_image` (`layer-typography`)                    |

Every route is a `list_base_models` filter except the last, which is two deterministic tools that
spend no Creative Units. Read `get_base_model` on the chosen model before the first run: the
language lists, presets and behaviour below live in its capabilities.

## Plan the matrix first

Before any run, write down assets by languages: each master `file_id`, each language's code, and
an empty cell for each output `file_id`. Languages are ISO 639-1 codes (`de`, `ja`, `pt`), which
name a language, not a market. If the user needs Brazilian rather than European Portuguese, say that
a code alone may not distinguish them and check the model's list.

Get approved translations from the user or their localisation vendor. If you translate copy yourself,
label it a draft for review: store copy, legal lines and character names are the user's call.

Price the whole matrix before the first run, and apply the 20 CU gate to the total. Pricing reads the
files, so pass each source to the estimate. Text to speech is priced per character, so each
language's script is its own estimate. When in doubt whether two languages price apart, estimate one
call per language.

## Voice

**Dubbing** keeps the original performance and changes its language. `target_language` is required on
dub models and must be one of the codes in `dub_languages`. Dub models differ in one decision that
matters more than voice quality:

- Some leave the picture and its length exactly as they are. Choose these when the dub goes back over
  an existing edit, a timeline, or a fixed-length ad slot.
- Others re-sync the lips and may lengthen or shorten the clip to the new language's pace. Choose
  these for an on-screen presenter, never for a clip that must keep its length.

The tool schema currently names ElevenLabs Dubbing for the first behaviour and HeyGen models for the
second; confirm with `get_base_model`, since the catalogue changes.

**Text to speech** suits a fresh voice-over from a translated script. Leave `speech_language` unset
and the model guesses from the text; set it when lines are short or full of names and loanwords,
which are exactly what a model reads in the wrong language. `text_normalization` controls how numbers
and dates are read, which differs by language. Reuse the same voice choices across a language's
lines so the character does not change voice mid-campaign.

Translated speech runs longer. German and French lines often outgrow the English, and a 15-second
slot does not stretch. Shorten the line, not the pacing: a small speed nudge is fine, a crammed read
is not.

## Captions

Filter for `use_case: "video_subtitle"`. Spell `subtitle_preset` exactly as one of the model's
`subtitle_presets`: any other name is quoted at the default style and then refused at launch. Presets
listed under `subtitle_dynamic_presets` animate word by word and bill at a higher rate, so pass the
same preset to the estimate. `subtitle_alignment`, `subtitle_color` and `subtitle_secondary_color`
apply only where the capabilities report them. The schema takes no caption text, so caption each
language's dub rather than the master, and confirm in `get_base_model` that the model captions that
language. For a dub or caption run, attach the source video in the guidance slot `get_base_model`
lists for the model; do not assume one.

Burned-in captions make one file per language, so keep the master without captions. Move captions to the
top when the lower third carries a CTA, gameplay UI or a lower-third title.

## Text in images

The cheapest localisation is art with no words baked in. Generate the master clean and letter each
language with `render_text` and `compose_image`.

Copy burned into a video frame, such as an end card, is out of reach of image tools. Ask for the
text-free end card first. Failing that, cover the end-card span on a `render_video_timeline` edit
(`layer-video-timeline`): an image or solid item over the old copy, and a text item set in the
language's font with `font_file_id`.

- **Script coverage.** A Latin brand font usually has no CJK, Cyrillic, Thai or Arabic glyphs, and
  missing glyphs render as empty boxes. Pick a family that covers the script (a Google Fonts family
  name in `font_family` works) and look at every render.
- **Direction and shaping.** For right-to-left and joined scripts, check visually that letters join
  and run in the right direction. If they do not, report it rather than ship it.
- **Expansion.** Size the text box for the longest language and render every language into the same
  box. When `render_text` refuses copy with the size it needs, shorten the copy or lower `font_size`
  consistently across the set, so one market's title is not visibly smaller.

When the words are already baked in, run an `edit_text` model on the master with the exact
replacement string quoted. Check it letter by letter. If it fails, remove the text once to a clean
plate (an `erase_object` or `inpainting` model) and letter the plate per language.

## Worked example

"Localise our 15-second 9:16 trailer and its end card into German, Japanese and Portuguese."

1. Matrix: trailer and end card masters by `de`, `ja`, `pt`. Ask whether Portuguese means Brazil,
   and for approved translations of the end card's two lines.
2. `list_base_models` with `use_case: "dub_video"`; `get_base_model` on candidates. The trailer must
   stay 15 seconds, so pick one that keeps picture and length, and confirm all three codes are in its
   `dub_languages`.
3. Estimate all three dubs with the trailer attached. The end cards need no estimate: they are deterministic.
   Present the total; above 20 CUs wait for an explicit yes.
4. `execute_forge` per language with `target_language`; poll each with `get_forge_run` at
   `poll_interval_seconds`. Watch each dub against the picture.
5. End card: the master has no text, so `render_text` each language into one shared box, the
   Japanese with a family that covers kana and kanji, then `compose_image` onto the master.
6. Fill the matrix with every output `file_id` and hand it over.

## Common mistakes

- Localising from another language's version instead of the master.
- A lip-resyncing dub dropped into a fixed-length edit, which then runs long or short.
- Estimating one language and assuming the rest cost the same.
- A brand font that lacks the script, shipped with empty boxes.
- Letting each language shrink its own font size until its copy fits.
- Translating store or legal copy and presenting it as final.
- Burning captions into the only copy of the master.
