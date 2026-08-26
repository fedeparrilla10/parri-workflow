---
name: to-plan
description: Turn an already-clarified conversation into a versioned feature plan. Use ONLY when the user explicitly asks to run to-plan or create PLAN.md from the current conversation.
---

# To Plan

Synthesize the current conversation into `docs/features/<feature-slug>/PLAN.md`.

This is a persistence step, not another interview. Just synthesize what you already know.

Derive a short kebab-case feature slug from the agreed work unless the user provides one.
**Write the plan in the language used by the user unless they request another language.**

## Process

1. Use the current conversation as the primary source.
2. Load `domain-modeling` in `capture` mode. Create or minimally update root `CONTEXT.md` only with durable domain terms explicitly resolved in the conversation.
3. If a proposed term conflicts with the existing glossary, stop and report the unresolved conflict instead of guessing or writing the plan.
4. Use the resulting canonical vocabulary and existing codebase knowledge to keep terminology and decisions accurate.
5. Create the feature directory and `PLAN.md`.
6. Preserve product intent, agreed constraints, and testing decisions without implementation trivia.
7. Do not generate phases or tickets. That belongs to `to-tickets` in a fresh conversation.

<spec-template>

## Plan format

# Feature name

## Problem Statement

The problem from the user's perspective.

## Solution

The agreed solution from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As a <actor>, I want a <feature>, so that <benefit>.

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

- Explicit exclusion.

## Further Notes

Only relevant information that does not belong above.

Make user stories complete without manufacturing variants or duplicating behavior. Include only decisions actually reached in the conversation. Omit empty optional sections rather than adding filler.

Avoid file paths and code snippets because they become stale. Include a compact schema, state machine, contract, or type shape only when it records an agreed decision more precisely than prose.

</spec-template>
