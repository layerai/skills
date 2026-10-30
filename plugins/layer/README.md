# Layer

Bring [Layer](https://layer.ai), the platform for AI game-asset creation, into your agent.
Generate 2D images, 3D meshes, video, and audio, browse a model-agnostic catalog (FLUX,
Imagen, Recraft, Kling, Minimax, and more), train styles from reference sets, and run
creative workflows, all through Layer's remote MCP server.

## What's included

| File              | Purpose                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugin.json`     | Agent Plugins manifest. OpenAI listing fields live under `extensions["com.openai"]`, Claude-only fields under `extensions["com.anthropic"]`. |
| `mcp.json`        | The Layer MCP server: `https://mcp.app.layer.ai/mcp`, Streamable HTTP.                                                                       |
| `skills/layer/`   | Onboarding skill: the generate loop, model choice, Creative Unit spending, and routing to the craft skills.                                  |
| `skills/layer-*/` | Craft skills: sprites, tilesets, textures, video, audio, game UI, UA creatives, and more.                                                    |

## Authentication

Your client handles OAuth. There is no API key and no secret in this plugin. On first use,
your client asks you to connect your Layer account. A free tier is available at
[layer.ai](https://layer.ai).

## Privacy

Layer's subprocessors are listed at
[trust.layer.ai/subprocessors](https://trust.layer.ai/subprocessors).

## Capabilities

- **Generate** images, 3D, video, and audio with Forge and multi-step workflows.
- **Estimate** the creative-unit (CU) cost of any generation before running it.
- **Browse** base models across every modality.
- **Train** styles from reference sets.
- **Manage** workspaces, projects, runs, and file uploads.

The server also ships instruction tools (`get_instructions`, `get_forge_instructions`,
`get_workflow_instructions`) that give your agent current usage guidance at runtime.

## Install

See [github.com/layerai/skills](https://github.com/layerai/skills#install).

## License

MIT © Layer
