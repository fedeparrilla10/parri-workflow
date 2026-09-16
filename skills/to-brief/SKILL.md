---
name: to-brief
description: Create or revise an expanded brief for one registered feature and link it from features.json. Use when create-feature delegates --brief or when the user explicitly asks to create, generate, or revise a feature brief.
---

# To Brief

Turn confirmed intake context into a persistent feature brief. Do not register a new feature, create SDD specifications, design a technical solution, create implementation tasks, inspect product code, or implement changes.

## Resolve the feature

Work in the current project root. Require one explicit feature ID from the user or the invoking skill. Parse and validate the complete `features.json` before editing it; stop rather than repairing or overwriting invalid state. Resolve exactly one matching entry. The feature must have `status: pending` and `sdd: true`; stop rather than changing its lifecycle or SDD decision.

Require the feature's `path` to be a non-null repository-relative directory created by `create-feature`. Use that exact path; never search for the directory with a wildcard. Stop if the path is invalid, missing, or not a directory; `create-feature` owns initial directory creation and `setup-harness` owns repair.

## Use the assigned context

When invoked by `create-feature`, use the input mode it supplies:

- Default mode: use the registered feature and relevant confirmed decisions from the current conversation, including completed `grill-me` discovery.
- Direct mode: use only the registered feature and the direct text passed in the handoff. Do not use earlier conversation.

For standalone use, use the registered feature and the context explicitly supplied by the user. Do not search code or infer missing product, technical, or business decisions. Ask only when the requested brief cannot be grounded in available confirmed information.

## Write the brief

Create `<feature-directory>/brief.md` with this structure:

```markdown
# Brief: <feature title>

## Idea

## Context

## Scope

## Out of Scope

## Proposed Plan

## Decisions and Constraints

## Scenarios and Edge Cases

## Open Questions
```

Expand the intake faithfully without turning the brief into another copy of `features.json`. Record the agreed product direction and plan, not a newly invented technical design. Keep unknown information explicit instead of filling gaps. The future SDD owns detailed requirements, technical design, and implementation tasks.

If the feature already references a brief, revise it only when explicitly requested. Preserve established decisions unless the user has replaced them. If `brief` is null but the exact target file already exists after an interrupted attempt, an explicit invocation may link it without rewriting only when it has the registered feature title and every required section above. Otherwise stop and ask whether to revise the file; do not link incomplete or unrelated content.

Once the target file has been written successfully or accepted as a valid interrupted attempt, set the feature's `brief` field to `<path>/brief.md`, for example `features/F-014-filter-products/brief.md`. Preserve every other feature and field. If updating `features.json` fails, report the unlinked file and the recovery action rather than claiming success.

Return only the feature ID and brief path, or a concise blocker.
