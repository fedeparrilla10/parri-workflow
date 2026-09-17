import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const orchestrator = await readFile(path.join(repoRoot, "agents/orchestrator.md"), "utf8")
const worker = await readFile(path.join(repoRoot, "agents/monday-worker.md"), "utf8")
const setup = await readFile(path.join(repoRoot, "skills/setup-monday/SKILL.md"), "utf8")
const completion = await readFile(path.join(repoRoot, "skills/monday/SKILL.md"), "utf8")

test("setup is project-local and keeps credentials out of files", () => {
  assert.match(setup, /Never edit the global configuration/)
  assert.match(setup, /https:\/\/mcp\.monday\.com\/mcp/)
  assert.match(setup, /opencode mcp auth monday/)
  assert.match(setup, /Never read `.env`, credential files, or stored OAuth tokens/)
})

test("setup uses one report and writable Numbers hours", () => {
  assert.match(setup, /Persist both the user-supplied board URL and its verified board ID/)
  assert.match(setup, /\.ai\/monday\.json/)
  assert.match(setup, /\.ai\/monday-report\.json/)
  assert.match(setup, /one Numbers column that stores decimal hours/)
  assert.match(setup, /cannot write or clear its timer value/)
  assert.match(setup, /launch `monday-worker` in `INSPECT_BOARD` mode/)
  assert.match(setup, /Do not create any other Monday state or report file/)
})

test("worker has narrow access and records only successful creations", () => {
  assert.match(worker, /"\.ai\/monday\.json": allow/)
  assert.match(worker, /"\.ai\/monday-report\.json": allow/)
  assert.match(worker, /monday_\*: allow/)
  assert.match(worker, /bash: deny/)
  assert.match(worker, /task: deny/)
  assert.match(worker, /Only after Monday confirms creation, append one object/)
  assert.match(worker, /Never append failed attempts/)
  assert.match(worker, /do not create a duplicate/)
  assert.match(worker, /make only the read-only board-schema call/)
})

test("Monday cannot block local completion", () => {
  assert.match(orchestrator, /load and follow `monday` only when `.ai\/monday\.json` exists/)
  assert.match(orchestrator, /result is always non-blocking/)
  assert.match(orchestrator, /set the feature to `done`/)
  assert.match(completion, /wait for explicit confirmation/)
  assert.match(completion, /do not retry/)
  assert.match(completion, /never determines local feature completion/)
})
