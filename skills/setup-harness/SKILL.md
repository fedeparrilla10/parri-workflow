---
name: setup-harness
description: Initialize or repair the Parri multi-agent harness in the current project. Use when the user asks to set up, install, initialize, bootstrap, or validate the feature workflow before creating or executing features.
---

# Setup Harness

Initialize the harness in the current project without creating a feature or modifying product code. Preserve existing project documentation and configuration; make only the missing or explicitly approved changes.

## Inspect first

Read the project structure, applicable `AGENTS.md`, and existing engineering documentation. Do not inspect or execute project commands, package-manager scripts, tests, framework CLIs, database operations, deployment tooling, or external services.

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

Do not overwrite or reset existing state. If `features.json` exists but is invalid JSON, stop and report the validation error. Preserve every existing feature entry and artifact unchanged. Setup does not create, normalize, or validate features; feature registration belongs to its dedicated workflow. Do not load feature-registration skills during setup.

## Engineering guide

If `docs/engineering.md` is absent, load `code-architecture` and complete its workflow before continuing. Do not infer desired architecture solely from legacy code. If the user declines to define it, leave setup incomplete and report the missing guide.

Ensure the applicable project `AGENTS.md` tells designing, implementing, and reviewing agents to read `docs/engineering.md`. Show the exact proposed `AGENTS.md` change and obtain approval before editing or creating that file.

## Generate init.sh

Create one executable root `init.sh`; never create `verify.sh`. For now it must only print `feature ok` and exit successfully. It must not inspect the project or execute Git, package managers, tests, lint, typecheck/static analysis, builds, framework CLIs, database operations, production or deployment commands, or external services.

## Validate

Run `./init.sh` after creation and confirm that its only output is `feature ok`.

Finish by listing created, preserved, and still-missing artifacts.
