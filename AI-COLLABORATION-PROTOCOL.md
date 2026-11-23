# Shared AI Collaboration Protocol

Status: coordination contract / bootstrap document
Canonical hub repository: https://github.com/mouzzlii/Kreislauf
Last updated: 2026-11-23

## Purpose

Use the user's existing GitHub account and repositories as the shared, durable hand-off layer between ChatGPT, Grok Build, Bolt.new, Gemini (when an authorized connection is available), and other development tools. This document does **not** claim that the agents have a live private chat channel or that one agent can invoke another agent's API.

## Ground rules for every project and every chat

1. Before claiming an integration is missing, inspect the user's prior project context and the relevant GitHub repository.
2. Treat the existing project repository as the source of truth. Do not start a duplicate project or re-import from an old ZIP when the repository already contains the current code.
3. Read the repository's `AGENTS.md`, any `AGENTS.project.md`, and project-specific instructions before editing.
4. Work on a clearly named feature branch. Do not push directly to `main` or merge/release without the user's explicit approval.
5. Keep changes small and non-overlapping when multiple agents work in parallel. Agree on file ownership and interfaces before parallel edits.
6. Every agent must report: repository + branch + commit SHA, files changed, tests actually run and their results, known limitations, and whether a deployment was verified.
7. Never report a build, test, deployment, API connection, or AI-to-AI communication as successful unless it was directly verified.
8. Never put API keys, access tokens, passwords, private user data, or secrets in Git, issues, PRs, browser code, or logs. Use the provider's secure secret manager only.
9. If two agents change the same files, stop and reconcile by comparing commits; do not overwrite another agent's work.
10. Use pull requests as the review/approval boundary. CI must pass for the exact proposed HEAD before merge.

## Roles

- **ChatGPT (coordination / integration):** maintain the cross-project plan, inspect repositories, define interfaces, review diffs, run available checks, integrate changes through branches/PRs, and report verified status.
- **Grok Build (implementation / browser QA when available):** use its existing project workspace and the instructions in `AGENTS.md`; commit changes to a named branch and report the exact commit. Its own sandbox and preview are not automatically visible to ChatGPT.
- **Bolt.new (UI implementation / prototyping when write access is enabled):** import the existing repository, preserve GitHub as source of truth, and commit to a feature branch. A view-only import is not a write-capable collaboration link.
- **Gemini / other agents:** participate only when a real, authorized connector or API is available. Otherwise their review can be brought in by a human as a GitHub issue/PR comment; do not simulate their responses.

## Handoff format

Use this format in GitHub issues or PR comments:

```text
[AI HANDOFF]
Project:
Task:
Repository:
Base branch:
Working branch:
Files/surfaces owned:
Interfaces/contracts to preserve:
Acceptance criteria:
Tests required:
Do not touch:
Report back with:
- commit SHA
- changed files
- tests + exact results
- remaining risks
[/AI HANDOFF]
```

## Current repository inventory visible to the connected GitHub account

These repositories were visible under the user's account on 2026-11-23. Project-to-repository ownership should be confirmed from each repository's own README/instructions before changes:

- `mouzzlii/Kreislauf`
- `mouzzlii/Pakete`
- `mouzzlii/Pakete-neu`
- `mouzzlii/multi-carrier-gateway`
- `mouzzlii/multi-carrier-gateway-neu`
- `mouzzlii/Paketescanner`
- `mouzzlii/ShopScannerNeu`
- `mouzzlii/Pakete-Scanner`
- `mouzzlii/Fuck`
- `mouzzlii/Gemeinwohl`
- `mouzzlii/CHRONOS`

SCAN-PROFIT was not present in this GitHub account's repository listing at the time of this check; its current source location must be found before treating it as part of this GitHub hub.

## Current integration facts (verified / qualified)

- ChatGPT's GitHub connector can read and write the repositories visible to the connected account.
- The Kreislauf repository contains a Grok Build-specific `AGENTS.md` and `.grok` workspace conventions.
- A branch named `chatgpt/integration-baseline` and a separate demo branch already exist.
- Bolt previously imported `mouzzlii/Kreislauf`, but the user's reported Bolt project state was view-only. Bolt must be re-authorized for repository write access in Bolt/GitHub before it can commit changes.
- No direct Gemini or Grok API connector is available in this ChatGPT tool session. A GitHub hand-off is shared work coordination, not a live agent-to-agent API tunnel.
- Existing Vercel project/deployment settings are separate from GitHub collaboration. A READY preview is not equivalent to production readiness.

## Activation checklist

- [ ] In Grok Build, open the existing Kreislauf workspace and confirm it is connected to `mouzzlii/Kreislauf` with commit/write access; do not create a duplicate.
- [ ] In Bolt, change the existing imported repository connection from view-only to write-capable (Contents read/write, Metadata read; PR access if offered), then verify a test branch commit can be made. Do not share a token in chat.
- [ ] For Gemini or another provider, use a supported first-party connector or a server-side integration with credentials entered only into that provider's secure secret store. Do not place credentials in this repository.
- [ ] Each agent reads this protocol and the repository's own `AGENTS.md` before work.
- [ ] Each project gets its own branch/PR and test evidence; this hub document does not authorize merging or production deployment.

## Security and approval boundary

Do not create a public relay that accepts arbitrary unauthenticated commands. Do not expose provider API keys to browser code. Any future automated agent relay must authenticate each agent, scope repository permissions, log actions, rate-limit calls, and require approval before merges, deployments, spending, or destructive operations.
