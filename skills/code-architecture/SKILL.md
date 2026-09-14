---
name: code-architecture
description: Define a project's desired architecture and coding conventions with the user and create or update docs/engineering.md. Use ONLY when the user explicitly asks to define, document, or update the project's engineering guide, or when setup-harness invokes it.
---

# Code Architecture

Agree how future code should be built and persist that agreement in `docs/engineering.md`. Keep architecture and coding conventions together so humans and agents have one authoritative engineering guide.

## Understand the project

Read applicable `AGENTS.md` instructions, the existing `docs/engineering.md`, and engineering documentation they reference. Reuse decisions already established in the conversation rather than asking the user to repeat them.

Inspect representative code in the area the user named. If the scope is the whole project, start with its structure and a representative end-to-end flow; expand only where a concrete decision needs more evidence. Delegate codebase searching and inspection to the `explore` subagent, using `quick` for a concrete lookup and `medium` for a flow across layers. Use `very thorough` only when explicitly requested.

Distinguish observed patterns from desired rules. Existing code is evidence of the current state, not approval of its design. When documentation and code differ, explain the relevant difference without treating every legacy deviation as a decision to reopen. For a new project, work from the user's goals and constraints rather than inventing an existing structure.

## Agree the direction

Present a concise diagnosis and a concrete recommendation grounded in the project. Ask focused questions about unresolved choices, one at a time, with trade-offs and a recommended option. Do not run a fixed architecture questionnaire or impose a named architecture, extra layers, or abstractions by default.

Focus on a handful of practical rules: where business logic belongs, what controllers handle, and any other responsibility or convention the user wants to establish. Do not expand this into a comprehensive architecture exercise.

Prefer simple, actionable rules over broad advice such as "use clean code." Discuss only topics relevant to this project. If the user has already resolved the decisions, synthesize them directly. Otherwise, confirm the proposed direction before persisting it; do not turn suggestions into agreed rules.

Agree a practical legacy policy. Recommend applying the guide to new code and keeping adaptations to existing code within the current task, preserving compatibility. A difference between old code and the desired architecture should not by itself trigger a refactor or stop implementation.

## Write the guide

Create or minimally update `docs/engineering.md` in the user's language. Preserve unrelated decisions. If the project already has authoritative architecture or convention documents elsewhere, agree whether to reference or consolidate them rather than duplicating competing rules.

Use `# Engineering` with short `## Architecture` and `## Conventions` sections. Aim for 5–10 rules and fewer than 40 lines; fewer rules are fine. Do not invent rules to reach a target or expand beyond it unless the user asks for more detail. Avoid directory trees, code snippets, diagrams, and long explanations.

For example, if these decisions were agreed with the user:

```markdown
# Engineering

## Architecture

- Los servicios contienen la lógica de negocio.
- Los controladores reciben las peticiones, delegan en los servicios y devuelven las respuestas.
- La validación de entrada se realiza antes de ejecutar la lógica de negocio.

## Conventions

- Las pruebas validan comportamiento observable.
- El código nuevo sigue estas reglas; el existente se adapta solo cuando la tarea lo necesita.
```

The example demonstrates brevity, not mandatory architectural choices. Record only the project's agreed rules, using its own terminology. Omit background explanations, exhaustive descriptions of the current code, file inventories, feature requirements, migration backlogs, and decision histories.

The guide describes the desired way to build code, not a claim that the whole repository already complies. Do not refactor application code, generate plans or tickets, or modify other workflow skills during this operation.

## Make it discoverable

If applicable `AGENTS.md` instructions do not already point to the guide, propose this reference in the user's language and ask permission before creating or editing `AGENTS.md`:

> Before designing, implementing, or reviewing code, read `docs/engineering.md` and follow the rules relevant to the change.

Once approved, make the smallest edit in the appropriate project `AGENTS.md`. If declined, leave the completed guide in place without adding the reference.

Finish with the guide's path and a concise summary of the decisions recorded.
