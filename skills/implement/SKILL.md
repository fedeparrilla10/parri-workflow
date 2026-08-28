---
name: implement
description: Implement a piece of work based on a spec or set of tickets. Use ONLY when the user explicitly asks to run implement, implement a ticket, address review feedback, complete a reviewed ticket, or discard a ticket.
---

# Implement

Implement exactly the ticket selected by the user. Treat it as the complete execution context and do not read its parent `PLAN.md`.

Before changing anything, retrieve only the `Status` field from every ticket listed in `Blocked by`. Do not open or read any other part of those tickets. Continue only when all blockers are `completed`. Otherwise, stop without modifying files and report each incomplete blocker and its status.

Delegate every codebase search, architectural investigation, and discovery of relevant files or existing patterns to the `explore` subagent. Keep that exploration out of the primary conversation. The implementing agent may directly read the selected ticket, repository instructions, and the specific files identified as necessary to edit, and may run validation commands itself.

Implement the smallest, clearest, and most direct solution that satisfies the ticket. Base decisions on what was found in the repository and remain consistent with its conventions, structure, and existing patterns. When several coherent alternatives exist, choose the simplest. Prioritize concise, readable code; when debating whether to create two files or solve the work clearly in one, choose one. Separate responsibilities only when there is a concrete need. For example, a controller may receive, process, and respond to requests; when business logic justifies separation, it may delegate that logic to a service.

Change `pending` to `in_progress`, implement only the selected ticket, and verify every acceptance criterion. Mark a checkbox `[x]` only after verification. Run typechecking regularly, relevant tests regularly, and the full test suite once at the end.

When every criterion passes, load `code-review` to review the ticket and the current ticket diff. If it reports blocking findings, uncheck affected criteria, leave the ticket `in_progress`, report the findings, and stop. Otherwise, change the ticket to `in_review` and stop for human review.

When addressing human feedback, change `in_review` back to `in_progress`, apply the requested corrections, validate again, and rerun `code-review` so it replaces the stale `Review` section.

Only explicit human approval may change `in_review` to `completed`. After approval, do not ask for another confirmation: change the status to `completed`, inspect the repository status and diff, stage only the implementation changes for this ticket, and create one commit. Use a multiline commit message with `feat: <concise summary>` as the subject, no scope, a blank line, and a factual body describing the concrete changes. Then obtain the full commit hash and replace `Pending.` under `## Commit` in the ignored ticket with that hash. The ticket itself is never staged or committed.

Only an explicit human instruction may change an active ticket to `discarded`; discarded tickets do not satisfy dependencies and must not produce a commit. Do not commit before human approval. Do not push, open a pull request, merge, or start another ticket.
