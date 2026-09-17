---
name: setup-harness
description: Initialize or repair the Parri multi-agent harness in the current project. Use when the user asks to set up, install, initialize, bootstrap, or validate the feature workflow before creating or executing features.
---

# Setup Harness

Initialize or repair the harness in the current project without creating a feature or modifying product code. Install one protected verification gate that validates harness state, proves the test database is non-production, and only then runs the project's real tests. Preserve existing documentation and configuration; make only missing or explicitly approved changes.

## Inspect first

Read the project structure, applicable `AGENTS.md`, existing engineering documentation, package manifests, test configuration, public application configuration, and test layout. Never read or request `.env`, `.env.*`, credential files, private keys, or secret-bearing logs. Do not execute project commands, package-manager scripts, tests, framework CLIs, database operations, deployment tooling, or external services during setup.

Require Git before making changes. Verify that `git` is available and that the project root is inside a work tree with `git rev-parse --is-inside-work-tree`. If either check fails, stop and report that the user must initialize or open the project as a Git repository; do not run `git init`.

## Create the state skeleton

Create missing harness artifacts:

```text
.ai/features.json
.ai/progress/current.md
.ai/progress/history.md
docs/engineering.md
init.sh
```

Use `[]` for a new `.ai/features.json`. Initialize `.ai/progress/current.md` as:

```markdown
# Current

No active feature.
```

Initialize `.ai/progress/history.md` as:

```markdown
# History
```

Do not overwrite or reset existing state. If `.ai/features.json` exists but is invalid JSON, stop and report the validation error. Preserve every existing feature entry and artifact unchanged. Setup does not create, normalize, or validate features; feature registration belongs to its dedicated workflow. Do not load feature-registration skills during setup. Do not detect, migrate, or reuse harness artifacts from legacy root-level `features/` or `progress/` paths.

## Engineering guide

If `docs/engineering.md` is absent, load `code-architecture` and complete its workflow before continuing. Do not infer desired architecture solely from legacy code. If the user declines to define it, leave setup incomplete and report the missing guide.

Ensure the applicable project `AGENTS.md` tells designing, implementing, and reviewing agents to read `docs/engineering.md`. Show the exact proposed `AGENTS.md` change and obtain approval before editing or creating that file. Keep `AGENTS.md` at its applicable discovery location rather than moving it under `.ai/`.

## Establish the project checks

Before writing `init.sh`, establish all of the following from public project files and, when needed, short questions to the user:

1. The exact command and arguments that run the project's complete test suite. Use a declared or clearly established command; never infer one only from a conventional script name.
2. A read-only command that resolves the same effective database identity used by that test command. It must write exactly one JSON object to stdout with three non-empty string fields: `environment`, `host`, and `database`. It must not connect to the database, print credentials, or include any other output.
3. Explicit public allowlists for test environment names, local database hosts, and test database names. Ask the user for values that cannot be established from public configuration. Default host suggestions may include `127.0.0.1`, `localhost`, and `::1`, but never add Docker service names or database names without user confirmation.

The identity command and test command must use the same test-environment setup. Prefer executable-plus-argument arrays; do not generate `eval`, `sh -c`, command substitution from untrusted text, or a command that reads `.env` directly. If the effective database identity cannot be obtained safely, ask the user for the missing project-specific decision before writing files. Do not leave placeholders or report successful setup without a configured safety check.

Setup configures the gate but does not create databases, users, schemas, containers, environment files, or other infrastructure. The harness may be completely installed while `./init.sh` remains red until the user prepares an environment matching the declared allowlists.

## Generate init.sh

Read `assets/init.sh` from this skill and use it as the protected template. Create exactly one executable root `init.sh`; never create `verify.sh`.

Replace every `__PARRI_*__` token with shell-safe values:

- JSON arrays for allowed environments, hosts, and database names;
- a shell array containing the database identity executable and its arguments;
- a shell array containing the complete test executable and its arguments.

Keep the generic harness validation, database preflight, ordering, output semantics, and no-arguments contract unchanged. The generated script must fail closed before product tests whenever identity resolution fails, returns malformed data, or resolves a value outside any allowlist. It must never print the observed identity or secrets.

If `init.sh` already exists, do not overwrite it. Prepare the proposed replacement, show the user its diff, and obtain explicit approval first. The same rule applies to any existing project-specific database safety implementation.

## Validate installation

Do not execute `./init.sh` during setup because doing so would run product tests. Instead:

1. Confirm no `__PARRI_*__` token remains.
2. Run `bash -n init.sh` to validate shell syntax only.
3. Confirm the executable bit is set.
4. Confirm the script rejects arguments, but do not invoke it to prove this when invocation could reach project checks.

Finish by listing created and preserved artifacts, the configured public allowlists and command names without observed database values, and any infrastructure the user still needs to prepare. Setup is complete when the gate is fully configured, even if the external test environment is not yet available.
