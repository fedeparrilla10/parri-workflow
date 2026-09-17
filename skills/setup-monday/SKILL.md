---
name: setup-monday
description: Install, enable, validate, or reconfigure the Monday MCP only for the current project's Parri workflow. Use whenever the user mentions installing or connecting Monday MCP in OpenCode, including /setup-monday; never configure it globally.
---

# Setup Monday

Configure Monday only for the explicitly selected current project. This integration is optional and must not alter feature state, product code, `init.sh`, or existing harness artifacts other than `.ai/monday.json` and `.ai/monday-report.json`. A generic request to install the Monday MCP means project-local setup, never global installation.

## Preconditions

Work from the target project root. If the current directory is not clearly the intended project, ask for its path and stop; do not fall back to the global OpenCode configuration. Require an existing `.ai/features.json`; otherwise stop and recommend setting up the harness. Never read `.env`, credential files, or stored OAuth tokens.

Locate the applicable project OpenCode configuration in this order: `opencode.json`, `opencode.jsonc`, `.opencode/opencode.json`. Never edit the global configuration. If more than one project configuration exists, ask which one is authoritative. If none exists, propose creating `opencode.json`.

Parse an existing configuration without discarding comments or unrelated fields. Stop on invalid configuration rather than replacing it.

## Enable the project MCP

Ensure the project configuration contains this semantic configuration, merged with existing values:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "monday": {
      "type": "remote",
      "url": "https://mcp.monday.com/mcp",
      "enabled": true,
      "oauth": {}
    }
  },
  "permission": {
    "monday_*": "deny"
  }
}
```

Treat this as a configuration-file change: show the exact proposed diff, explain that it loads the hosted Monday MCP only in this project and denies its tools by default; the globally defined `monday-worker` has the sole agent-level override. Then wait for explicit approval before editing. Do not replace existing `$schema`, `mcp`, or `permission` siblings.

## Select the board mapping

When the `monday_*` tools are available, ask the user for the Monday board URL and extract its board ID. Ask whether a specific group should be used; `null` means Monday's default group.

Before querying Monday, show the exact read-only MCP call as `monday_get_board_schema` with arguments `{ "boardId": <numeric-board-id> }`, explain that it reads the selected board schema, and wait for explicit confirmation. After approval, launch `monday-worker` in `INSPECT_BOARD` mode with only the board ID; do not call `monday_*` tools directly. Keep this internal delegation out of the user-facing flow unless it fails or the user asks about it.

If inspection fails specifically because Monday requires authentication, show the exact command `opencode mcp auth monday`, explain that it opens Monday OAuth in the browser and stores the credential in OpenCode's credential store, and wait for explicit confirmation before running it. After successful authentication, retry the already-approved inspection. Do not treat an unavailable MCP tool as an authentication failure; tell the user to verify that OpenCode was restarted from the project after configuration.

Use the returned board schema to select and verify:

- one Status column and the numeric index of the label that means done;
- one Numbers column that stores decimal hours;
- the optional group ID.

Do not select a Time Tracking column for hours. Monday's API can read that column and create one, but cannot write or clear its timer value. Stop if the selected columns or status index cannot be proven from the board schema.

## Persist the project mapping

Create or update `.ai/monday.json` with this shape:

```json
{
  "version": 1,
  "board_url": "https://example.monday.com/boards/123456789",
  "board_id": "123456789",
  "group_id": null,
  "status": {
    "column_id": "status",
    "index": 1,
    "label": "Done"
  },
  "hours": {
    "column_id": "numbers",
    "type": "numbers"
  }
}
```

Persist both the user-supplied board URL and its verified board ID so the destination is explicit and inspectable without calling Monday. IDs are non-empty strings, `group_id` is a non-empty string or `null`, the status index is a non-negative integer, and the hours type is exactly `numbers`. When reconfiguring, replace this mapping only after validating the new board. Stop rather than repairing an invalid existing mapping.

Initialize `.ai/monday-report.json` only when absent:

```json
{
  "version": 1,
  "entries": []
}
```

Never change or remove existing successful entries while configuring Monday. Stop rather than repairing an invalid existing report.

Before showing the diffs, explain that `.ai/monday.json` stores the verified project mapping and `.ai/monday-report.json` records successful item creations for traceability. Show the exact proposed diffs and wait for explicit approval before writing either file. Do not create any other Monday state or report file.

Finish with the selected board, group, status label, and hours column. Remind the user that completed features will ask for decimal hours and explicit approval before creating an item.
