---
name: implement
description: Implement a piece of work based on a spec or set of tickets. Use ONLY when the user explicitly asks to run implement, implement a ticket, address review feedback, complete a reviewed ticket, or discard a ticket.
---

# Implement

Implement exactly the ticket selected by the user. Treat it as the complete execution context and do not read its parent `PLAN.md`.

Before changing anything, inspect every ticket listed in `Blocked by`. Continue only when all blockers are `completed`. Otherwise, stop without modifying files and report each incomplete blocker and its status.

Change `pending` to `in_progress`, implement only the selected ticket, and verify every acceptance criterion. Mark a checkbox `[x]` only after verification. Run typechecking regularly, relevant tests regularly, and the full test suite once at the end.

When every criterion passes, load `code-review` to review the ticket and the current phase diff. If it reports blocking findings, uncheck affected criteria, leave the ticket `in_progress`, report the findings, and stop. Otherwise, change the ticket to `in_review` and stop for human review.

When addressing human feedback, change `in_review` back to `in_progress`, apply the requested corrections, validate again, and rerun `code-review` so it replaces the stale `Review` section.

Only explicit human approval may change `in_review` to `completed`. Only an explicit human instruction may change an active ticket to `discarded`; discarded tickets do not satisfy dependencies.

Do not commit, push, open a pull request, merge, or start another ticket.
