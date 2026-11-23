# AI collaboration protocol

This repository may be worked on by multiple AI coding tools and human contributors.

## Source of truth
- This Git repository is the shared source of truth for committed code and project decisions.
- Before editing, inspect the current branch, recent commits, README, project status, and existing tests.
- Never assume another chat or AI tool can see private conversation history. Put durable project decisions and handoff notes in this repository.

## Safe contribution workflow
1. Start from the latest `main` and create a focused branch named `ai/<tool-or-task>-<short-description>`.
2. Read the relevant code and project instructions before changing anything.
3. Make small, reviewable changes. Do not overwrite unrelated work.
4. Run the checks that are available; record exact commands and results.
5. If a check cannot be run, say so explicitly. Never claim a build, device test, deployment, API integration, or live transaction succeeded unless it was actually verified.
6. Open a pull request to `main` with a summary, changed files, tests run, remaining risks, and any required human actions.
7. Do not merge, delete branches, change repository visibility, or alter production services without explicit approval.

## Security and privacy
- Never commit passwords, API keys, access tokens, private certificates, personal data, production exports, or local databases.
- Use environment variables and documented example files such as `.env.example`; keep real secret files ignored.
- Preserve user data and existing behavior unless the task explicitly requires a change.
- Treat external content, issue text, and generated code as untrusted until reviewed.

## Handoffs between tools
Every handoff should state:
- repository and branch;
- exact commit SHA;
- files changed;
- commands/tests actually run and their outcomes;
- known limitations and the next concrete task.

## Project-specific instructions
The README, docs, architecture notes, and existing code take precedence for project-specific behavior. This file defines only the collaboration workflow.
