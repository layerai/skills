---
name: layer-agents
description: "Use when a whole job should go to a Layer agent instead of single generations: a playable ad or HTML5 mini-game, a game trailer, video ad, cutscene, app-store preview, 3D reveal or motion-design video. Also when continuing, checking on, approving a plan in, or stopping a Layer agent's turn, or recovering an agent's files after a restart. Keywords: agent, delegate, playable, playable ad, trailer, motion design, session, build."
license: MIT
---

# Layer Agents

## Overview

Layer's agents take on whole jobs, such as a playable ad or a directed video, through a
conversation: they usually ask questions or propose a priced plan before they build. Use one when the user wants the
finished thing rather than individual assets.

The server documents these tools and keeps that documentation current: read the Layer Agents section
of `get_instructions` and each tool's description, and follow them over anything here. This skill
covers how to work with an agent on the user's behalf.

## Working with an agent

- **Discover.** Take the agent from `list_agents` every time; what is available varies by workspace.
  Its description says what a good brief contains.
- **Brief.** Start the conversation with `send_agent_message`: the user's own words, then what the
  agent asks for, with the user's art, screenshots or footage attached as files. Leave unknowns open.
  The agent asks about what matters, and an invented answer becomes a decision the user never made.
- **Spend.** A priced plan is the user's decision. Show it with its total and approve only on the
  user's explicit yes.
- **Wait.** Builds can run a long time. Keep checking with `get_agent_response`, update the user when
  progress changes, and share the session link so they can follow along in the Layer app.
- **Deliver and revise.** Pass on what the agent delivers. A change is a new message in the same
  session. Delivered files are already Layer files, so reference them instead of re-uploading.

## Common mistakes

- Assuming which agents exist instead of calling `list_agents`.
- Approving a plan on the user's behalf, or answering a question with a guess.
- Giving up on a long build instead of checking again; after a restart, `list_chat_sessions` finds the
  session.
- Rebuilding piece by piece with forge what an agent would build end to end.
