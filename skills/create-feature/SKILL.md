---
name: create-feature
description: Register a new feature in the current project's .ai/features.json, deriving a concise contract and deciding whether SDD is needed. Use whenever the user asks to create, add, queue, or register feature work, including /create-feature with --direct, --sdd, --no-sdd, or --brief.
---

# Create Feature

Register work for the orchestrator. Do not implement code, generate specifications, design a solution, create tasks, or review changes.

## Input modes

- Default: derive the feature from the current request and relevant decisions already established in the conversation.
- `--direct`: use only the text supplied with the current instruction. Do not summarize earlier conversation.
- `--sdd`: force `sdd: true`.
- `--no-sdd`: force `sdd: false`.
- `--brief`: explicitly request an expanded brief from the intake context and imply `sdd: true`.

Reject `--sdd` combined with `--no-sdd`, and reject `--brief` combined with `--no-sdd`. If direct mode has no feature text, ask for it. Ask questions only when the available context cannot produce a concrete description and observable acceptance criteria.

## Ensure the index

Work in the current project root. If `.ai/features.json` is absent, create `.ai/` and the file containing `[]`. If it exists, parse and validate it before editing; stop rather than repairing or overwriting invalid state. Do not detect, migrate, or reuse a legacy root-level `features.json`.

When valid existing entries predate the `path` or `brief` fields, normalize the missing fields to `null` while appending the new feature. Do not otherwise change existing entries. A pre-existing SDD feature with a missing or null `path`, or with a path outside `.ai/features/`, requires explicit repair before execution; never migrate it or rediscover its directory with a wildcard.

The rest of the harness is not required to register work. If `.ai/progress/`, `docs/engineering.md`, or `init.sh` is missing, register the feature and then recommend setting up the harness.

## Build the feature contract

Create exactly one entry:

```json
{
  "id": "F-001",
  "title": "Concise action-oriented title",
  "description": "What observable problem or behavior should change.",
  "acceptance_criteria": [
    "Observable outcome"
  ],
  "path": null,
  "brief": null,
  "sdd": false,
  "status": "pending"
}
```

Choose the next ID by taking the highest numeric `F-NNN` ID and adding one, starting at `F-001`. Never reuse a missing or deleted number. Preserve all existing entries and their order, then append the new entry. Use the user's language.

Only when `sdd` is true, create the feature directory as `.ai/features/<feature-id>-<slug>/.gitkeep`, for example `.ai/features/F-001-filter-products/.gitkeep`, and store its repository-relative directory in `path`, for example `"path": ".ai/features/F-001-filter-products"`. Derive a concise lowercase kebab-case slug from the title, remove diacritics, and use only `a-z`, `0-9`, and hyphens; use `feature` if no usable characters remain. The feature ID is the stable identity. Never create a second directory with the same `<feature-id>-` prefix. When `sdd` is false, keep `path: null` and do not create `.ai/features/` or a feature directory.

Write acceptance criteria as specific observable outcomes. Include unchanged behavior or relevant error behavior when it materially protects against regression. Do not add implementation steps, file paths, architecture choices, test plans, or speculative scope.

## Decide SDD

Use `sdd: false` for a small, localized, obvious, low-ambiguity change such as copy, simple validation, or a focused bug fix.

Use `sdd: true` when the work introduces non-trivial behavior, spans layers or modules, requires technical decisions, has multiple cases or edge cases, changes migrations/contracts/APIs, or carries meaningful regression risk.

An explicit override always wins. Otherwise, prefer `sdd: true` when uncertainty is material; do not turn every feature into SDD.

## Finish

Write valid, consistently formatted JSON. When `--brief` is present, load the `to-brief` skill after registering the feature and follow it for the new feature ID. Preserve the selected input mode so `--direct` never gains access to earlier conversation through the handoff. Do not duplicate the brief workflow here.

Return the feature ID, title, SDD decision with one short reason, the feature directory when SDD is enabled, the brief path when requested and successfully created, and whether setup is still needed.
