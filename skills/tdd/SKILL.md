---
name: tdd
description: Runs Parri's behavior-by-behavior RED, freeze, and GREEN implementation loop. Use ONLY when loaded by the Parri Implementer while implementing or correcting an assigned feature; no other agent should use this skill.
---

# TDD

## Access restriction

This skill belongs exclusively to the Parri Implementer. Stop without performing implementation work if the active agent is not the Implementer. Do not reinterpret this procedure for planning, orchestration, or review.

## Default loop

For requested behavior that has a sensible automated test, use behavior-by-behavior TDD as the default implementation loop. Work one behavior at a time, whether or not the feature has `tasks.md`:

1. Write one test for observable behavior without modifying production code.
2. Run `./init.sh` and confirm RED. The new test must fail for the reason that corresponds to the missing behavior.
3. Freeze the test after confirmed RED for this implementation cycle.
4. Modify production code to satisfy the frozen test.
5. Run `./init.sh`, change production code until the test and complete gate are GREEN, then move to the next behavior.

Do not write the entire test suite upfront.

## Confirm RED

A database safety, test infrastructure, syntax, or unrelated test failure does not confirm RED. If the new test unexpectedly passes, investigate and correct the test before proceeding. The test remains editable until RED is confirmed for the expected reason.

## Freeze after RED

After confirmed RED, you must not delete, skip, weaken, change the expected result, or rewrite that frozen test merely to obtain GREEN. Change production code instead.

If implementation reveals that a frozen test represents the requirement incorrectly, do not modify it silently. Stop and write the implementation report with:

```text
<workflow-status>IMPLEMENTATION_BLOCKED</workflow-status>

Reason: TEST_CHANGE_REQUEST
Test: <test identifier>
Contract conflict: <why the frozen expectation may be wrong>
Requested human decision: <keep the test or approve the exact change>
```

If the human approves changing the test, correct it on the next invocation, run `./init.sh` to confirm RED again, freeze it again, and continue. If the human rejects the request, keep the test frozen and continue by changing production code.

## Exceptions and evidence

When behavior has no sensible automated test, implement it without inventing a nominal test and explain why in the implementation report.

For every completed cycle, record the behavior, test, expected RED reason, and GREEN result in `.ai/progress/impl_<feature-id>.md`. When `tasks.md` exists, mark a task complete only after all of its behaviors complete this loop and the gate passes.
