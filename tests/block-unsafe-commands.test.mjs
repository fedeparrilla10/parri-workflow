import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const pluginPath = path.join(repoRoot, "plugins/block-artisan.js")
const source = await readFile(pluginPath, "utf8")
const plugin = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`)

test("only the exact gate and its syntax check are accepted", () => {
  assert.equal(plugin.blockedCommand("./init.sh"), null)
  assert.equal(plugin.blockedCommand("bash -n init.sh"), null)
  assert.match(plugin.blockedCommand("./init.sh --no-testing"), /exactly/)
  assert.match(plugin.blockedCommand("bash ./init.sh"), /exactly/)
  assert.equal(plugin.blockedCommand("git diff -- init.sh"), null)
})

test("direct test runners and database clients are blocked", () => {
  for (const command of [
    "vendor/bin/phpunit",
    "python3 -m unittest discover",
    "npm test",
    "composer run test",
    "node --test tests",
    "go test ./...",
    "mysql app",
    "psql customers",
    "php artisan test",
  ]) {
    assert.notEqual(plugin.blockedCommand(command), null, command)
  }
})

test("environment files are protected while examples remain readable", () => {
  assert.equal(plugin.isProtectedEnvFile(".env"), true)
  assert.equal(plugin.isProtectedEnvFile("/project/.env.testing"), true)
  assert.equal(plugin.isProtectedEnvFile("/project/.env.example"), false)
  assert.equal(plugin.isProtectedEnvFile("/project/config/database.php"), false)
})

test("plugin hook rejects protected reads and unsafe commands", async () => {
  const hooks = await plugin.BlockUnsafeCommands()
  await assert.rejects(
    hooks["tool.execute.before"](
      { tool: "read" },
      { args: { filePath: "/project/.env.production" } },
    ),
    /environment files/,
  )
  await assert.rejects(
    hooks["tool.execute.before"](
      { tool: "bash" },
      { args: { command: "pytest" } },
    ),
    /Direct test runners/,
  )
})
