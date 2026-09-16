# Security Policy

## Reporting a vulnerability

Do not open a public issue for a security problem.

Report vulnerabilities in the Layer platform, the MCP server, or the API through Layer's in-app
support at [layer.ai](https://layer.ai), or by email to security@layer.ai.

For a problem in this repository's own content (a skill that instructs an agent to leak credentials,
a malicious supporting script, a dependency advisory), open a
[private security advisory](https://github.com/layerai/skills/security/advisories/new).

## Scope of this repository

These skills are markdown instructions for AI agents. They call the Layer MCP server and nothing
else. They never ask a user to paste a credential into a conversation, never echo a token, and never
send workspace content to a third party. A change that would do any of those is a security defect,
not a feature, and should be reported as one.

## Credentials

Nothing in this repository contains or accepts a secret. The MCP server authenticates with OAuth, and
the Personal Access Token path documented at [Setup](https://layer.ai/docs/mcp/setup) is configured
in your client, never here.
