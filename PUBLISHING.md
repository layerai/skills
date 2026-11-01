# Publishing

CI builds and validates the plugin. Listing it in a directory and every OpenAI release are manual.

## Every release

1. `task version:set VERSION=x.y.z`. Claude Code users only receive an update when the version
   changes, and OpenAI rejects a submission that reuses a version.
2. Update `extensions["com.openai"].publication.release_notes` in `plugins/layer/plugin.json`.
3. `task check`, commit, and merge to `main`.
4. Download the `layer-<version>.zip` artifact from the Plugin workflow run on `main` and upload
   it to OpenAI as is, or build it locally with `task package`.

## Anthropic: Claude plugin directory

**Blocked by policy until Anthropic grants written permission.** Section 4B of the
[Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)
excludes "Software that uses AI models to generate images, video, or audio content" from both the
plugin and connector directories, unless Anthropic expressly permits it in writing. Ask an Anthropic
partner contact before submitting. Installs from this repository's marketplace are not affected.

With permission, list the plugin once at <https://claude.ai/directory/manage>. You need a paid Claude
plan and a connected GitHub account with push access to the repository.

1. Submit a **Plugin bundle**: repository `layerai/skills`, plugin path `plugins/layer`, branch `main`. You
   can't change the repository or folder later.
2. Press **Validate** in the portal. It checks README length, license, and name availability, which
   `claude plugin validate` doesn't.
3. Submit the MCP server separately as an **MCP connector** with the same URL
   (`https://mcp.app.layer.ai/mcp`) so the two listings can be paired. The connector review needs
   test credentials for a fully populated account, plus documentation, privacy policy, support
   contact, and an icon.

After the listing is live, the directory follows `main` and scans each new commit before serving it.

## OpenAI: ChatGPT and Codex plugin directory

One-time prerequisites:

- An OpenAI organization with individual or business verification, and the Owner role or Apps
  Management Write.
- A project without EU data residency. Those projects can't submit MCP plugins.
- A reviewer test account without MFA.
- A demo video of the plugin. Put its URL in `extensions["com.openai"].review.demo_recording_url`.

First submission:

1. Go to <https://platform.openai.com/plugins> and upload `dist/layer-<version>.zip`. Choose **With
   MCP**, never **Skills only**: an MCP server can't be added to a skills-only plugin later.
2. In the MCPs tab, enter `https://mcp.app.layer.ai/mcp`. The portal shows a domain-verification
   token and ChatGPT's OAuth client metadata URL. Both have to be registered on Layer's side before
   the next step: the token is served from the MCP host, and Layer's OAuth tenant only accepts
   clients registered in advance. Layer's internal infrastructure runbook covers how.
3. Back in the portal, complete domain verification, OAuth setup, and the tool scan.
4. Enter the reviewer test credentials and reviewer instructions in the dashboard. The ZIP must not
   contain them.
5. Submit, wait for the email decision, then press **Publish**.

Later releases: upload the new ZIP, submit, and press **Publish** again.

OpenAI's daily scan picks up MCP tool changes without a new ZIP. Skill or listing changes need a new
ZIP, a new review, and another Publish. The MCP origin (`https://mcp.app.layer.ai`) can never change
for an existing plugin.

Validation codes: <https://developers.openai.com/plugins/deploy/submission-errors>.
