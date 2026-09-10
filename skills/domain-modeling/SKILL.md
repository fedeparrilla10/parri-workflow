---
name: domain-modeling
description: Create, read, update, and validate the repository's CONTEXT.md domain glossary. Use when explicitly requested or when invoked by grill-me, to-plan, or code-review to work with canonical domain language.
---

# Domain Modeling

Build and sharpen the project's domain language without turning `CONTEXT.md` into general documentation.

The caller must request one of three operations:

- `read`: return the existing canonical vocabulary without changing files.
- `capture`: create or minimally update the glossary from terms explicitly resolved with the human.
- `check`: compare supplied language against the glossary and report conflicts or avoided terms.

If no operation is specified, infer it from the explicit request. Prefer `read` or `check` over writing.

## File location

Use one `CONTEXT.md` at the repository root. Create it lazily, only when the first durable domain term has been resolved.

If no file exists during `read` or `check`, return silently with no glossary. Do not create an empty file.

Use the structure in [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md).

## Admission test

Add or change a term only when every statement is true:

- It is specific to the project's domain.
- The human explicitly resolved its meaning in the conversation.
- It represents a distinct concept rather than a duplicate entry.
- It is not an implementation, architecture, framework, database, or workflow detail.
- Its definition fits in one or two sentences.

If any statement is false, make no change.

## Capture

When capturing resolved language:

1. Read the existing glossary once when present.
2. Extract only durable terms established in the current conversation.
3. Choose one canonical term for each concept.
4. Put ambiguous synonyms and incorrect alternatives under `_Avoid_`.
5. Apply the smallest possible edit and preserve unrelated entries.
6. Report the terms added, changed, or left unchanged.

Never infer a glossary from a broad codebase scan. Code can confirm or contradict a proposed definition, but code alone does not establish product meaning. If code must be inspected for that limited purpose, delegate all searching and inspection to the `explore` subagent; do not inspect application code in the primary conversation. Use `quick` thoroughness for a concrete lookup and `medium` only when the answer requires tracing multiple files or layers. Use `very thorough` only when the user explicitly requests it.

Never replace a conflicting definition silently. Report the conflict and require the human to resolve it through `grill-me` before writing.

## Check

When checking language:

- Prefer canonical terms from the glossary.
- Report uses of terms listed under `_Avoid_`.
- Report one term being used for multiple distinct concepts.
- Report multiple terms being used for the same concept.
- Do not modify the glossary.

## Context budget

Keep `CONTEXT.md` compressed:

- One or two sentences per definition.
- One entry per domain concept.
- No examples unless needed to distinguish two concepts.
- No feature requirements, implementation details, architecture decisions, file paths, history, or temporary notes.
- Soft limit: 100 lines.

When the file approaches 100 lines, stop adding entries and ask the human whether obsolete terms should be removed or the repository contains multiple domain contexts. Do not split the file automatically.

Prefer making no change. Update `CONTEXT.md` only when the conversation established durable language that future features will reuse.
