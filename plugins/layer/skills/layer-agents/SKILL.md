---
name: layer-agents
description: "Use when a whole job should go to a Layer agent instead of single generations: a playable ad or HTML5 mini-game, a game trailer, video ad, cutscene, app-store preview, 3D reveal or motion-design video. Also when continuing, checking on, approving a plan in, or stopping a Layer agent session, or recovering an agent's files after a restart. Keywords: agent, delegate, playable, playable ad, trailer, motion design, session, build."
license: MIT
---

# Layer Agents

## Overview

Layer's managed agents take on whole jobs that would otherwise be dozens of forge runs plus editing:
a playable ad built in the user's art style, or a directed video rendered to MP4. You write the
brief, relay the agent's questions and plan to the user, and pass the finished files back.

Call `get_instructions` once per session first; its Layer Agents section and error list are the
server's own contract for these tools.

If a sibling skill named here is missing from your available skills, ask the user to install it
(`npx skills add layerai/skills --skill <name>`); unattended, proceed from tool schemas and flag the
gap.

## Quick reference

| Step     | Tool                                           | What matters                                                                                                                                 |
| -------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Discover | `list_agents`                                  | `agent_id`, a `description` saying what the brief needs, and `round_estimates`: Creative Units and minutes per build round at each `effort`. |
| Attach   | `request_file_upload_url` / `upload_file`      | Upload local art first; up to 10 `file_ids` per message. A `file_id` from a run in the same workspace works as is.                           |
| Start    | `send_agent_message`                           | `workspace_id`, `agent_id`, `message`, `effort`, a fresh `idempotency_key`. Returns `session_id`, `turn_id`, `session_url`.                  |
| Wait     | `get_agent_response`                           | Waits server side up to `wait_seconds` (default the maximum). Call again straight away while `queued` or `working`.                          |
| Reply    | `send_agent_message`                           | Same `session_id`, a new `idempotency_key`.                                                                                                  |
| Stop     | `cancel_agent_turn`                            | Work already delivered is kept.                                                                                                              |
| Recover  | `list_chat_sessions` then `get_agent_response` | `get_agent_response` with only `session_id` reads the latest turn.                                                                           |

## Briefing the agent

An empty `list_agents` result means agents are turned off for this user here; say so and offer forge
instead.

Write the first message as the brief a producer would get. Include the user's own words, then what
the agent's `description` asks for: for a playable, the game or a reference game and the mechanic;
for a video, the game, what the video is for (store preview, UA ad, launch trailer), and the format.
Attach the user's art, screenshots, footage or an existing playable HTML as `file_ids`. Attachments
carry the look far better than adjectives.

Leave unknowns as unknowns. The agent asks about what matters to it, and an invented answer in the
brief becomes a decision the user never made.

`effort` (`low`, `medium`, `high`) on `send_agent_message` sets how hard the builder works and how
much a round costs. A new session starts at `medium`, and whatever a message passes holds for the
rest of the session. Set it on the first message, quoting `round_estimates` when the user cares about
cost, and leave it unchanged on the message that approves a plan: the plan was priced at the effort
it was asked at. A build starts only when the workspace holds one round's units.

## The conversation loop

A turn usually ends on one of three things, read from the `get_agent_response` result:

- **A question** in `reply`. Answer it yourself when the user's request already settles it; otherwise
  put it to the user in their terms and send their answer back.
- **A priced plan** in `pending_plan` (`summary`, `total_creative_units`), laid out in `reply`. This
  is the spend decision for the build. Show the user the plan and its total (`get_workspace` gives
  the balance), and send approval as an ordinary reply only when the user says yes. Never approve on
  their behalf, whatever the amount.
- **Finished work** in `outputs`. With `outputs_kind: delivered` these are the final files, latest
  version of each: pass them on with their `url` and `preview_url`. With `for_review` the agent
  delivered nothing yet, `outputs` is everything it made this turn, and `reply` says which files
  matter and what it needs from you. Look at them before answering.

A question or a plan is back within a call or two. A build takes 15 to 45 minutes. While `working`,
give the user a short update from `progress` when it changes, rather than polling silently or
narrating every call. Share `session_url` early: the user can watch and talk to the agent in the
Layer app too.

`status: failed` carries `error`; tell the user and offer to retry with a new message on the same
session. When `error` says the workspace lacks Creative Units, send the user to the Layer app for
credits. `cancelled` means the turn was stopped.

## Revisions

Feedback is a new message in the same session: say what to change and attach the delivered file's
`file_id` when the change is about that file. Delivered files are ordinary Layer files, so their
`file_id` also feeds forge runs, `set_file_lifecycle_status`, or another agent. Never download and
re-upload them.

## Worked example

"Make a 15-second vertical ad for our match-3 game. Here are three screenshots."

1. `list_agents` with the `workspace_id`. Pick the agent whose `description` covers video ads and
   note its `round_estimates`.
2. `request_file_upload_url` for each screenshot, upload, keep the three `file_id` values.
3. `send_agent_message`: the agent's `agent_id`, the `workspace_id`, `file_ids`, a fresh
   `idempotency_key`, and `message`: "15-second 9:16 video ad for our match-3 game, for paid social.
   Gameplay screenshots attached. User's words: 'Make a 15-second vertical ad for our match-3 game.'"
   Tell the user the `session_url`.
4. `get_agent_response` with `session_id` and `turn_id`. The agent asks whether to end on a store
   CTA and which store. The request does not settle it, so ask the user, who says App Store and
   Google Play.
5. `send_agent_message` on the same `session_id` with that answer and a new `idempotency_key`.
6. `get_agent_response` returns `pending_plan` at 180 Creative Units. Show the plan summary and the
   total. The user says yes; send "Approved, go ahead."
7. Keep calling `get_agent_response`, relaying `progress` as it changes. About 30 minutes later,
   `completed` with `outputs_kind: delivered` and an MP4 in `outputs`. Present its `url`.

## Common mistakes

- Assuming an `agent_id` instead of taking it from `list_agents`.
- Approving a `pending_plan` without the user's explicit yes, or answering a question with a guess.
- Sending while a turn runs. That fails with `TURN_IN_PROGRESS`: wait, or `cancel_agent_turn` first.
- Reusing an `idempotency_key` for a new message. The same key returns the original turn; reuse it
  only to retry a send that may not have landed.
- Passing `agent_id` on a follow-up. Omit it and the agent that last replied answers; pass it again
  only when no agent has replied yet (a failed or cancelled first turn).
- Treating `for_review` outputs as the deliverable.
- Giving up on a long build instead of calling `get_agent_response` again; after a restart, recover
  with `list_chat_sessions`.
- Rebuilding with forge what the agent would have built end to end.
- Guessing at `FEATURE_DISABLED`. It means agents, or this agent, are off for the user; relay the
  error's message, which says who can turn it on.
