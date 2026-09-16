const normalizeCommand = (command) =>
  String(command ?? "")
    .replace(/\\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const isProtectedEnvFile = (filePath) => {
  const name = String(filePath ?? "").split(/[\\/]/).pop()
  return name !== ".env.example" && (name === ".env" || name.startsWith(".env."))
}

const blockedCommand = (command) => {
  if (command === "./init.sh" || command === "bash -n init.sh") {
    return null
  }

  if (/(^|(?:&&|\|\||[;|])\s*)(?:bash\s+)?(?:\.\/|\S*\/)init\.sh(?:\s|$)/i.test(command)) {
    return "init.sh must be executed exactly as ./init.sh"
  }

  if (/(^|[;&|]\s*|\s)(?:\S*php\S*\s+)?(?:\S*\/)?artisan(?:\s|$)/i.test(command)) {
    return "Artisan commands are not allowed"
  }

  const directTestRunner = [
    /(^|[;&|]\s*|\s)(?:\S*\/)?(?:phpunit|pest|pytest)(?:\s|$)/i,
    /(^|[;&|]\s*|\s)python3?\s+-m\s+unittest(?:\s|$)/i,
    /(^|[;&|]\s*|\s)composer\s+(?:run\s+)?test(?:\s|$)/i,
    /(^|[;&|]\s*|\s)(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?test(?:\s|$)/i,
    /(^|[;&|]\s*|\s)node\s+--test(?:\s|$)/i,
    /(^|[;&|]\s*|\s)go\s+test(?:\s|$)/i,
    /(^|[;&|]\s*|\s)cargo\s+test(?:\s|$)/i,
  ]
  if (directTestRunner.some((pattern) => pattern.test(command))) {
    return "Direct test runners are not allowed; use ./init.sh"
  }

  if (/(^|[;&|]\s*|\s)(?:\S*\/)?(?:mysql|mariadb|psql|sqlite3|mongosh|redis-cli)(?:\s|$)/i.test(command)) {
    return "Direct database clients are not allowed"
  }

  return null
}

export const BlockUnsafeCommands = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "read" && isProtectedEnvFile(output.args.filePath ?? output.args.path)) {
        throw new Error("BLOCKED: AI agents are not allowed to read environment files.")
      }

      if (input.tool !== "bash") {
        return
      }

      const reason = blockedCommand(normalizeCommand(output.args.command))
      if (reason) {
        throw new Error(`BLOCKED: ${reason}. Run the command manually outside OpenCode.`)
      }
    },
  }
}

export const BlockArtisanCommands = BlockUnsafeCommands
export { blockedCommand, isProtectedEnvFile, normalizeCommand }
