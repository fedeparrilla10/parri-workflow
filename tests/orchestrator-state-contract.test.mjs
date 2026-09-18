import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const orchestrator = await readFile(path.join(repoRoot, "agents/orchestrator.md"), "utf8")

test("features.json is authoritative and current.md is only an operational handoff", () => {
  assert.match(orchestrator, /`\.ai\/features\.json` is the sole authority for feature identity and global status/)
  assert.match(orchestrator, /`\.ai\/progress\/current\.md` is only an operational handoff/)
})

test("orchestrator reconciles safe drift and blocks ambiguous recovery", () => {
  assert.match(orchestrator, /validate the handoff against the authoritative feature record before selecting or launching a child agent/)
  assert.match(orchestrator, /rebuild `current\.md` from `features\.json`/)
  assert.match(orchestrator, /stop as blocked rather than guessing or launching a child agent/)
})

test("global transitions persist authority before handoff and child execution", () => {
  assert.match(orchestrator, /persist `\.ai\/features\.json` first, then update `\.ai\/progress\/current\.md`/)
  assert.match(orchestrator, /Never launch a child between the two state writes/)
})
