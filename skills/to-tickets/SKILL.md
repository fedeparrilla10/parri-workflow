---
name: to-tickets
description: Split a feature PLAN.md into small, vertical, self-contained ticket files with explicit dependencies. Use ONLY when the user explicitly asks to run to-tickets or generate tickets from a plan.
---

# To Tickets

Compile `docs/features/<feature-slug>/PLAN.md` into self-contained implementation tickets under `docs/features/<feature-slug>/tickets/`.

Each ticket is an execution context for a fresh conversation. An implementing agent must be able to complete it without reading `PLAN.md` or another ticket for context. For a dependency, retrieve only its `Status` field; do not open or read the rest of that ticket.

Do not load `domain-modeling` or read `CONTEXT.md`. A plan produced by `to-plan` already uses canonical vocabulary; compile all context needed for execution into each ticket.

## Process

1. Read the complete plan. Where repository knowledge is needed, delegate all codebase searching and inspection to the `explore` subagent; do not inspect application code in the primary conversation. Use `quick` thoroughness for a concrete lookup and `medium` only when the answer requires tracing multiple files or layers. Use `very thorough` only when the user explicitly requests it.
2. Break the work into narrow vertical slices.
3. Ensure every slice delivers observable behavior through all necessary layers and can be verified independently.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

4. Keep every ticket small enough to implement in one fresh context window.
5. Give every ticket its direct blockers and ensure the dependency graph has no cycles.
6. Ensure the tickets collectively cover every user story and agreed constraint in the plan.
7. Present the proposed ticket titles, outcomes, and blockers to the user.
8. Wait for explicit approval of the breakdown before writing ticket files.
9. Write one Markdown file per approved ticket, numbered in dependency order.

Prefer a vertical slice over separate database, backend, frontend, or testing tickets. Create a preparatory horizontal ticket only when no independently working vertical slice is technically possible; give it an independently verifiable outcome.

## Ticket location

```text
docs/features/<feature-slug>/
├── PLAN.md
└── tickets/
    ├── 01-<ticket-slug>.md
    ├── 02-<ticket-slug>.md
    └── 03-<ticket-slug>.md
```

## Ticket format

Use exactly this structure and no additional sections:

```markdown
# 01: <Ticket title>

**What to build:** <A concise, self-contained description of the observable result, including all relevant product context, decisions, and constraints.>

**Blocked by:** None (can start immediately).

**Status:** pending

- [ ] <Acceptance criterion.>
- [ ] <Acceptance criterion.>

## Commit

Pending.
```

For blocked tickets, identify every direct blocker by number and title:

```markdown
**Blocked by:** 01: <Ticket title>; 02: <Ticket title>.
```

Write tickets in the same language as the plan. Start every ticket as `pending` with every checkbox unchecked.

The only valid statuses are `pending`, `in_progress`, `in_review`, `completed`, and `discarded`. Keep `Commit` as `Pending.` until `implement` completes the approved ticket and records the implementation commit hash. Do not create labels, other tracker metadata, comments sections, central status indexes, commits, or additional files.

| Label         | Meaning                             |
| ------------- | ----------------------------------- |
| `pending`     | Ticket is awaiting action           |
| `in_progress` | Ticket is currently being worked on |
| `in_review`   | Ticket is under human review        |
| `completed`   | Ticket is finished successfully     |
| `discarded`   | Will not be actioned                |

Do not point an implementing agent back to `PLAN.md`. Distill all context needed for that ticket into `What to build` and its acceptance criteria. Avoid implementation checklists; acceptance criteria describe behavior that can be observed or verified.
