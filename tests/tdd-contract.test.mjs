import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const implementer = await readFile(path.join(repoRoot, "agents/implementer.md"), "utf8")
const reviewer = await readFile(path.join(repoRoot, "agents/reviewer.md"), "utf8")
const tdd = await readFile(path.join(repoRoot, "skills/tdd/SKILL.md"), "utf8")
const nonImplementers = await Promise.all(
  ["orchestrator", "reviewer", "sdd-create", "monday-worker"].map(async (name) => [
    name,
    await readFile(path.join(repoRoot, `agents/${name}.md`), "utf8"),
  ]),
)

test("implementer is the only Parri agent with a tdd permission override", () => {
  assert.match(implementer, /skill:\s*\n\s+"\*": deny\s*\n\s+"tdd": allow/)
  assert.match(implementer, /load and follow the `tdd` skill before modifying tests or production code/i)

  for (const [name, source] of nonImplementers) {
    assert.doesNotMatch(source, /"tdd": (?:allow|deny)/, name)
  }
})

test("tdd skill is restricted to implementer", () => {
  assert.match(tdd, /^name: tdd$/m)
  assert.match(tdd, /Use ONLY when loaded by the Parri Implementer/)
  assert.match(tdd, /Stop without performing implementation work if the active agent is not the Implementer/)
})

test("tdd skill defines behavior-by-behavior RED GREEN", () => {
  assert.match(tdd, /default implementation loop/)
  assert.match(tdd, /one behavior at a time/)
  assert.match(tdd, /write one test[\s\S]*run `[.]\/init[.]sh`[\s\S]*confirm RED[\s\S]*freeze[\s\S]*production code[\s\S]*GREEN/i)
  assert.match(tdd, /Do not write the entire test suite upfront/)
})

test("tdd skill distinguishes an expected RED from a broken gate", () => {
  assert.match(tdd, /fail for the reason that corresponds to the missing behavior/)
  assert.match(tdd, /database safety[\s\S]*test infrastructure[\s\S]*syntax[\s\S]*unrelated test/i)
  assert.match(tdd, /unexpectedly passes[\s\S]*investigate and correct the test/i)
})

test("a test is frozen after RED and requires human approval to change", () => {
  assert.match(tdd, /must not delete, skip, weaken, change the expected result, or rewrite that frozen test/i)
  assert.match(tdd, /<workflow-status>IMPLEMENTATION_BLOCKED<\/workflow-status>/)
  assert.match(tdd, /TEST_CHANGE_REQUEST/)
  assert.match(tdd, /approv\w*[\s\S]*confirm RED again[\s\S]*freeze/i)
})

test("implementation report records auditable RED GREEN evidence", () => {
  assert.match(implementer, /behavior, test, expected RED reason, and GREEN result/i)
})

test("reviewer checks production code, test quality, and frozen-test integrity", () => {
  assert.match(reviewer, /Review both production code and tests/)
  assert.match(reviewer, /observable behavior rather than implementation details/)
  assert.match(reviewer, /important obvious behavior is missing from the tests/)
  assert.match(reviewer, /frozen test was modified after confirmed RED without an approved `TEST_CHANGE_REQUEST`/)
  assert.match(reviewer, /use `REVIEW_FAILED`/i)
})
