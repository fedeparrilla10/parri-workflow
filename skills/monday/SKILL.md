---
name: monday
description: Complete the optional Monday side effect after a Parri feature passes its final gate. Use ONLY when the orchestrator finds .ai/monday.json while closing a feature.
---

# Monday Completion

Monday is optional and never determines local feature completion. Handle one post-gate attempt, then return control to the orchestrator whether it succeeds, fails, or is skipped.

Read `.ai/monday.json` and require version 1, a non-empty `board_url` and `board_id`, an optional `group_id`, a Status column with a non-negative numeric index and label, and an hours column whose type is exactly `numbers`. Require `.ai/monday-report.json` to contain version 1 and an entries array. On invalid or missing data, show the problem and return without editing either file.

Ask the user for non-negative decimal hours. Show the exact proposed `monday_create_item` arguments: configured board and optional group, item name `<feature-id> - <feature-title>`, configured Status column with its numeric index, and configured Numbers column with those hours. Explain that this creates an external Monday item, then wait for explicit confirmation.

If the user declines, return `MONDAY_SKIPPED`. If approved, launch `monday-worker` in `CREATE_ITEM` mode with only the feature ID, title, and hours. Do not call Monday tools directly.

On `MONDAY_CREATED <item-id> <item-url-or-null>`, reread `.ai/monday-report.json`. Report success only when exactly one matching entry contains the returned item ID, configured board ID, exact hours, and status label. On `MONDAY_FAILED <reason>`, malformed output, missing entry, or mismatched entry, show a concise warning and do not retry. Failed attempts are never persisted.

Return one concise result to the orchestrator. Never modify `.ai/features.json`, `.ai/progress/`, product code, or the Monday mapping.
