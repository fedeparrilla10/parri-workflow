---
name: setup-harness
description: Initialize or repair the Parri multi-agent harness in the current project. Use when the user asks to set up, install, initialize, bootstrap, or validate the feature workflow before creating or executing features.
---

# Setup Harness

Initialize the harness in the current project without creating a feature or modifying product code. Preserve existing project documentation and configuration; make only the missing or explicitly approved changes.

## Inspect first

Read the project structure, applicable `AGENTS.md`, package manifests, test configuration, and existing engineering documentation. Determine the project's real verification commands from declared scripts and established tooling. Do not invent commands or install dependencies.

Require Git before making changes. Verify that `git` is available and that the project root is inside a work tree with `git rev-parse --is-inside-work-tree`. If either check fails, stop and report that the user must initialize or open the project as a Git repository; do not run `git init`.

## Create the state skeleton

Create only missing artifacts:

```text
features.json
progress/current.md
progress/history.md
docs/engineering.md
init.sh
```

Use `[]` for a new `features.json`. Initialize `progress/current.md` as:

```markdown
# Current

No active feature.
```

Initialize `progress/history.md` as:

```markdown
# History
```

Do not overwrite or reset existing state. If `features.json` exists but is invalid, stop and report the validation error. Normalize valid legacy feature entries without a `brief` field by adding `"brief": null`; preserve every other field and value.

For every SDD feature already registered, require one directory named `features/<feature-id>-<slug>/`. If none exists, create it with `.gitkeep` using the same slug rules as `create-feature`; if more than one directory has the same `<feature-id>-` prefix, stop and report the ambiguity. Do not create `features/` when no registered feature uses SDD. Preserve every existing feature artifact.

## Engineering guide

If `docs/engineering.md` is absent, load `code-architecture` and complete its workflow before continuing. Do not infer desired architecture solely from legacy code. If the user declines to define it, leave setup incomplete and report the missing guide.

Ensure the applicable project `AGENTS.md` tells designing, implementing, and reviewing agents to read `docs/engineering.md`. Show the exact proposed `AGENTS.md` change and obtain approval before editing or creating that file.

## Generate init.sh

Create one executable root `init.sh`; never create `verify.sh`. It must use reliable exit codes and:

1. Require `git`, verify that the project root is inside a Git work tree, and fail clearly otherwise.
2. Require `features.json`, `progress/current.md`, `progress/history.md`, and `docs/engineering.md`.
3. Parse `features.json` with an already available standard runtime.
4. Accept only `pending`, `spec_ready`, `in_progress`, and `done`.
5. Validate unique `F-NNN` IDs and required feature fields.
6. Require `brief` to be `null` or the exact repository-relative `features/<feature-id>-<slug>/brief.md` path; reject a non-null brief for a non-SDD feature and require the referenced file to exist.
7. Require exactly one directory matching `features/<feature-id>-*/` for every SDD feature; do not require a feature directory when `sdd` is false.
8. Reject more than one `in_progress` feature.
9. For an SDD feature in `spec_ready`, `in_progress`, or `done`, require `requirements.md`, `design.md`, and `tasks.md` inside its feature directory.
10. Check required project tools and dependencies without installing them.
11. Run the project's real test, lint, typecheck/static-analysis, and build commands when they are declared or clearly established.
12. Avoid Artisan, database, production, deployment, and other destructive commands.

Keep project checks explicit in the generated script. Do not create a generic package-manager guesser that may run unintended scripts.

## Validate

Run `./init.sh` after creation. Fix harness-only failures. For missing project dependencies or failing product checks, report the failure without changing product code.

Finish by listing created, preserved, and still-missing artifacts.
