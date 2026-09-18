import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const pluginPath = path.join(repoRoot, "plugins/block-artisan.js")
const source = await readFile(pluginPath, "utf8")
const implementer = await readFile(path.join(repoRoot, "agents/implementer.md"), "utf8")
const plugin = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`)
const hooks = await plugin.BlockUnsafeCommands()
const beforeToolExecution = hooks["tool.execute.before"]

const runBash = (command) =>
  beforeToolExecution({ tool: "bash" }, { args: { command } })

const readFileWithPlugin = (filePath) =>
  beforeToolExecution({ tool: "read" }, { args: { filePath } })

const editFileWithPlugin = (filePath) =>
  beforeToolExecution({ tool: "edit" }, { args: { filePath } })

test("only the exact gate and its syntax check are accepted", async () => {
  await assert.doesNotReject(runBash("./init.sh"))
  await assert.doesNotReject(runBash("bash -n init.sh"))
  await assert.rejects(runBash("./init.sh --no-testing"), /exactly/)
  await assert.rejects(runBash("bash ./init.sh"), /exactly/)
  await assert.doesNotReject(runBash("git diff -- init.sh"))
})

test("direct test runners are allowed", async () => {
  for (const command of [
    "vendor/bin/phpunit",
    "python3 -m unittest discover",
    "npm test",
    "composer run test",
    "node --test tests",
    "go test ./...",
    "cargo test",
  ]) {
    await assert.doesNotReject(runBash(command), command)
  }
})

test("Artisan and database clients remain blocked", async () => {
  for (const command of [
    "mysql app",
    "psql customers",
    "php artisan test",
  ]) {
    await assert.rejects(runBash(command), /BLOCKED/, command)
  }
})

test("environment files are protected while examples remain readable", async () => {
  await assert.rejects(readFileWithPlugin(".env"), /environment files/)
  await assert.rejects(readFileWithPlugin("/project/.env.testing"), /environment files/)
  await assert.doesNotReject(readFileWithPlugin("/project/.env.example"))
  await assert.doesNotReject(readFileWithPlugin("/project/config/database.php"))
})

test("environment files cannot be edited while examples remain editable", async () => {
  await assert.rejects(editFileWithPlugin(".env"), /environment files/)
  await assert.rejects(editFileWithPlugin("/project/.env.testing"), /environment files/)
  await assert.doesNotReject(editFileWithPlugin("/project/.env.example"))
  await assert.doesNotReject(editFileWithPlugin("/project/config/database.php"))
})

test("implementer edit permissions deny environment files", () => {
  const editPermissions = implementer.match(/  edit:\n([\s\S]*?)  task:/)?.[1]

  assert.ok(editPermissions, "implementer edit permissions must exist")
  for (const rule of [
    '    ".env": deny',
    '    ".env.*": deny',
    '    "**/.env": deny',
    '    "**/.env.*": deny',
    '    ".env.example": allow',
    '    "**/.env.example": allow',
  ]) {
    assert.match(editPermissions, new RegExp(rule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  }
})

test("plugin hook rejects protected reads and unsafe commands", async () => {
  await assert.rejects(
    beforeToolExecution(
      { tool: "read" },
      { args: { filePath: "/project/.env.production" } },
    ),
    /environment files/,
  )
  await assert.rejects(
    beforeToolExecution(
      { tool: "bash" },
      { args: { command: "psql customers" } },
    ),
    /Direct database clients/,
  )
})
