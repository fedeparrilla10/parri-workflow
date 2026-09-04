---
name: code-review
description: Review one implemented feature ticket against its acceptance criteria, repository standards, and a focused Fowler code-smell baseline, then write findings and human QA guidance into the ticket. Use when explicitly requested by the user or invoked by implement after ticket validation.
---

# Code Review

Review the changes for exactly one implemented ticket. This is a focused pre-review for the human, not a substitute for human approval.

Read the selected ticket directly and use it as the complete product specification. Do not read its parent `PLAN.md` or any other ticket.

## Inputs

If the diff introduces or renames domain-facing symbols, and a root `CONTEXT.md` exists, load `domain-modeling` in `check` mode. Report names that conflict with canonical terms or use `_Avoid_` alternatives as recommendations. Do not load it for changes that do not affect domain language, and never update the glossary during review.

## Ticket compliance

Check whether:

- Every checked acceptance criterion is implemented and supported by evidence.
- Required behavior is missing, partial, or incorrect.
- The change introduces behavior outside the ticket.
- Tests exercise observable behavior at an appropriate public boundary.
- Relevant error paths, side effects, scale, security, and data integrity are handled.

## Standards and code smells

Report violations of documented repository standards. Inspect the diff for this Fowler-inspired baseline and return only supported findings with file-and-line evidence:

- **Mysterious Name**: a function, variable, parameter, or type whose name does not reveal its purpose.
- **Duplicated Code**: the same logic shape appears in more than one place.
- **Feature Envy**: code reaches into another module's data more than its own.
- **Data Clumps**: the same fields or parameters repeatedly travel together.
- **Primitive Obsession**: a primitive represents a domain concept that needs explicit behavior or constraints.
- **Repeated Switches**: the same conditional dispatch recurs in multiple places.
- **Shotgun Surgery**: one logical change requires scattered edits across unrelated modules.
- **Divergent Change**: one module changes for several unrelated reasons.
- **Speculative Generality**: abstractions, options, or hooks exist for requirements the ticket does not have.
- **Message Chains**: callers navigate through long chains of collaborators or data.
- **Middle Man**: a module mostly delegates without hiding meaningful complexity.
- **Refused Bequest**: an implementation inherits behavior or an interface it mostly rejects.

Code smells are advisory judgement calls, not blocking findings by themselves. Skip formatting and issues already enforced by automated tooling.

## Severity

Classify a finding as `blocking` only when there is concrete evidence of incorrect behavior, an unmet acceptance criterion, a regression, a failing required check, a security or data-integrity problem, or a serious documented-standard violation.

Classify code smells, maintainability concerns, and optional improvements as recommendations. Do not inflate severity.

## Human QA

Recommend only checks that benefit from human judgement or an environment the agent cannot validate. Focus on risky interactions, visual behavior, real integrations, concurrency, permissions, destructive operations, and uncertainties exposed by the diff.

Do not repeat the ticket's acceptance criteria, restate a blocking finding as a manual check, or suggest generic checks. Write `None.` when there is no distinct, high-value check for the human.

## Write the review

Append this section to the selected ticket. If `## Review` already exists, replace it entirely so stale findings do not accumulate.

```markdown
## Review

**Blocking findings:**

- `path/to/file:line` - <Concrete problem and evidence.>

**Recommendations:**

- `path/to/file:line` - <Documented-standard concern or named code smell.>

**Human QA:**

- <Specific check for the human reviewer.>
```

Write `None.` under an empty category. Cite file and line for every code finding. Keep the section concise and use the ticket's language.

Do not modify implementation code, acceptance checkboxes, or ticket status. Do not commit, push, open a pull request, or merge. Return control to `implement` or the user after writing the review.
