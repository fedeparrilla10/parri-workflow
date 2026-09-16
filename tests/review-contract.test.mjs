import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const reviewer = await readFile(path.join(repoRoot, "agents/reviewer.md"), "utf8")
const orchestrator = await readFile(path.join(repoRoot, "agents/orchestrator.md"), "utf8")

const reviewSignals = (source) =>
  new Set([...source.matchAll(/<workflow-status>(REVIEW_[A-Z]+)<\/workflow-status>/g)].map((match) => match[1]))

test("reviewer and orchestrator share the review signals", () => {
  const expected = new Set(["REVIEW_PASSED", "REVIEW_FAILED", "REVIEW_BLOCKED"])

  assert.deepEqual(reviewSignals(reviewer), expected)
  assert.deepEqual(reviewSignals(orchestrator), expected)
})

test("review cannot pass without evidence for every acceptance criterion", () => {
  assert.match(reviewer, /PASS only when every acceptance criterion has concrete evidence\./)
  assert.match(reviewer, /Use `REVIEW_BLOCKED` instead of PASS or FAIL when the missing evidence requires an operation agents are prohibited from performing/)
})

test("manual review blocks completion until user confirmation and the final gate", () => {
  assert.match(orchestrator, /On `REVIEW_BLOCKED`, keep the feature `in_progress`/)
  assert.match(orchestrator, /stop until the user explicitly confirms every requested result/)
  assert.match(orchestrator, /Do not relaunch the reviewer or implementer for that confirmation\./)
  assert.match(orchestrator, /after the user confirms every result for `REVIEW_BLOCKED`, run exactly `\.\/init\.sh` once more/)
})
