---
name: layer
description: "AI game asset creation — generate images, videos, 3D models, and audio using 30+ AI models. Supports editing, upscaling, background removal, and multi-step creative pipelines."
license: MIT
---

# Layer — AI Game Asset Creation

Layer is the AI-powered platform for game asset creation. Generate production-ready images, videos, 3D models, and audio using 30+ state-of-the-art AI models — all through one unified interface.

Creative Units (CUs) are the consumption currency. Always check workspace balance before expensive operations.

## When to Use Layer

Use Layer tools when the user wants to:
- Generate images (sprites, textures, concept art, UI elements, icons, illustrations)
- Generate videos (trailers, cutscenes, animations, promotional clips)
- Create 3D models (meshes with PBR textures, riggable characters)
- Generate audio (sound effects, text-to-speech)
- Edit images (recolor, restyle, add/remove elements via natural language)
- Upscale or enhance existing images
- Remove backgrounds, vectorize rasters, create tileable textures
- Run multi-step creative pipelines combining multiple AI models

## What You Can Create

**Image**
- General Purpose — versatile generation for UI, marketing, icons, illustrations
- Pixel Art / Game Sprites — retro sprites, icons, and tile assets
- Environment / Concept Art — landscapes, dungeons, world maps, atmospheric scenes
- Character / Stylized Art — portraits, hero art, NPCs, cel-shaded/comic styles
- Editing — modify images via natural-language instructions
- Upscaling — increase resolution while preserving detail
- Special — inpainting, outpainting, tileability, transparency, vectorization, background removal

**Video**
- General Purpose — high-quality clips with optional audio generation
- Long-Form / Multi-Shot — extended video with scene sequencing
- Speed — fast generation for previews and iteration

**3D**
- General Purpose — text/image to mesh with PBR textures

**Audio**
- Sound Effects — generate audio from text descriptions

**Utility**
- Conversion & Processing — vectorize to SVG, remove backgrounds

## Two Ways to Generate

**Forge** — Run a single model directly. Best for quick generations, parameter tuning, and batch runs. Use when you know which model you want.

**Workflows** — Execute multi-step pipelines that chain models together. Best for complex generation tasks with multiple stages. Discover available workflows per workspace.

## Getting Started

1. Call `get_instructions` for full platform guidance
2. Call `list_workspaces` to get the user's workspace ID and CU balance
3. Call `get_model_recommendations` to find the best model for the task
4. **Forge path**: `get_forge_instructions` → `estimate_forge_price` → `execute_forge` → poll with `get_forge_run`
5. **Workflow path**: `get_workflow_instructions` → `list_workflows` → `estimate_workflow_price` → `execute_workflow` → poll with `get_workflow_run`

## Key Principles

- **Estimate before executing** — always call the estimate tool to check price and balance
- **Poll at the returned interval** — execute calls return `poll_interval_seconds`
- **Reuse file IDs** — output assets from one run can feed directly into the next without re-upload
- **Session naming** — group related generations under a `session_name` for easy browsing in the Layer app
- **Ask before expensive runs** — if estimated cost exceeds 15 CUs (workflows) or 5 CUs (forge), confirm with the user first
