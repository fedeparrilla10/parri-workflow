import assert from "node:assert/strict"
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const template = readFileSync(path.join(repoRoot, "skills/setup-harness/assets/init.sh"), "utf8")

const shellQuote = (value) => `'${value.replaceAll("'", `'"'"'`)}'`

const createFixture = (identity, features = [], featureDirectories = []) => {
  const directory = mkdtempSync(path.join(repoRoot, ".tmp-init-test-"))
  mkdirSync(path.join(directory, ".ai/progress"), { recursive: true })
  mkdirSync(path.join(directory, "docs"))
  for (const featureDirectory of featureDirectories) {
    mkdirSync(path.join(directory, featureDirectory), { recursive: true })
  }
  writeFileSync(path.join(directory, ".ai/features.json"), `${JSON.stringify(features, null, 2)}\n`)
  writeFileSync(path.join(directory, ".ai/progress/current.md"), "# Current\n")
  writeFileSync(path.join(directory, ".ai/progress/history.md"), "# History\n")
  writeFileSync(path.join(directory, "docs/engineering.md"), "# Engineering\n")
  writeFileSync(
    path.join(directory, "identity.mjs"),
    `process.stdout.write(${JSON.stringify(JSON.stringify(identity))})\n`,
  )
  writeFileSync(
    path.join(directory, "tests.mjs"),
    'import { writeFileSync } from "node:fs"\nwriteFileSync("suite-ran", "yes")\n',
  )

  const script = template
    .replace("__PARRI_ALLOWED_TEST_ENVIRONMENTS_JSON__", '["testing"]')
    .replace("__PARRI_ALLOWED_DB_HOSTS_JSON__", '["127.0.0.1","localhost","::1"]')
    .replace("__PARRI_ALLOWED_DB_NAMES_JSON__", '["app_test"]')
    .replace("__PARRI_DATABASE_IDENTITY_COMMAND__", `${shellQuote(process.execPath)} ${shellQuote("identity.mjs")}`)
    .replace("__PARRI_TEST_COMMAND__", `${shellQuote(process.execPath)} ${shellQuote("tests.mjs")}`)

  writeFileSync(path.join(directory, "init.sh"), script)
  chmodSync(path.join(directory, "init.sh"), 0o755)
  return directory
}

const runFixture = (identity, args = [], features = [], featureDirectories = []) => {
  const directory = createFixture(identity, features, featureDirectories)
  try {
    const result = spawnSync("bash", ["init.sh", ...args], {
      cwd: directory,
      encoding: "utf8",
    })
    return {
      status: result.status,
      output: `${result.stdout}${result.stderr}`,
      suiteRan: existsSync(path.join(directory, "suite-ran")),
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test("safe database identity allows the product suite", () => {
  const result = runFixture({ environment: "testing", host: "localhost", database: "app_test" })
  assert.equal(result.status, 0)
  assert.equal(result.suiteRan, true)
  assert.match(result.output, /\[OK\] Database safety/)
  assert.match(result.output, /\[OK\] Complete gate/)
})

test("production identity fails before the product suite", () => {
  const identity = { environment: "production", host: "db.internal", database: "customers" }
  const result = runFixture(identity)
  assert.equal(result.status, 1)
  assert.equal(result.suiteRan, false)
  assert.match(result.output, /\[FAIL\] Database safety could not be proven/)
  assert.doesNotMatch(result.output, /production|db\.internal|customers/)
})

test("malformed identity fails before the product suite", () => {
  const result = runFixture({ host: "localhost", database: "app_test" })
  assert.equal(result.status, 1)
  assert.equal(result.suiteRan, false)
})

test("arguments are rejected before project checks", () => {
  const result = runFixture(
    { environment: "testing", host: "localhost", database: "app_test" },
    ["--no-testing"],
  )
  assert.equal(result.status, 1)
  assert.equal(result.suiteRan, false)
  assert.match(result.output, /does not accept arguments/)
})

test("registered SDD path allows a pending feature", () => {
  const featurePath = ".ai/features/F-001-filter-products"
  const features = [{
    id: "F-001",
    title: "Filter products",
    description: "Filter the catalog",
    acceptance_criteria: ["Products can be filtered"],
    path: featurePath,
    brief: null,
    sdd: true,
    status: "pending",
  }]
  const result = runFixture(
    { environment: "testing", host: "localhost", database: "app_test" },
    [],
    features,
    [featurePath],
  )

  assert.equal(result.status, 0)
  assert.equal(result.suiteRan, true)
})

test("missing registered SDD path fails before product tests", () => {
  const features = [{
    id: "F-001",
    title: "Filter products",
    description: "Filter the catalog",
    acceptance_criteria: ["Products can be filtered"],
    path: ".ai/features/F-001-filter-products",
    brief: null,
    sdd: true,
    status: "pending",
  }]
  const result = runFixture(
    { environment: "testing", host: "localhost", database: "app_test" },
    [],
    features,
  )

  assert.equal(result.status, 1)
  assert.equal(result.suiteRan, false)
  assert.match(result.output, /references a missing SDD directory/)
})

test("SDD path must match the feature ID", () => {
  const featurePath = ".ai/features/F-002-filter-products"
  const features = [{
    id: "F-001",
    title: "Filter products",
    description: "Filter the catalog",
    acceptance_criteria: ["Products can be filtered"],
    path: featurePath,
    brief: null,
    sdd: true,
    status: "pending",
  }]
  const result = runFixture(
    { environment: "testing", host: "localhost", database: "app_test" },
    [],
    features,
    [featurePath],
  )

  assert.equal(result.status, 1)
  assert.equal(result.suiteRan, false)
  assert.match(result.output, /has an invalid path/)
})

test("legacy root-level SDD paths are rejected", () => {
  const featurePath = "features/F-001-filter-products"
  const features = [{
    id: "F-001",
    title: "Filter products",
    description: "Filter the catalog",
    acceptance_criteria: ["Products can be filtered"],
    path: featurePath,
    brief: null,
    sdd: true,
    status: "pending",
  }]
  const result = runFixture(
    { environment: "testing", host: "localhost", database: "app_test" },
    [],
    features,
    [featurePath],
  )

  assert.equal(result.status, 1)
  assert.equal(result.suiteRan, false)
  assert.match(result.output, /has an invalid path/)
})
