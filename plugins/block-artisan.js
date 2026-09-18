const normalizeCommand = (command) =>
  String(command ?? "")
    .replace(/\\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isProtectedEnvFile = (filePath) => {
  const name = String(filePath ?? "")
    .split(/[\\/]/)
    .pop();
  return (
    name !== ".env.example" && (name === ".env" || name.startsWith(".env."))
  );
};

const blockedCommand = (command) => {
  if (command === "./init.sh" || command === "bash -n init.sh") {
    return null;
  }

  if (
    /(^|(?:&&|\|\||[;|])\s*)(?:bash\s+)?(?:\.\/|\S*\/)init\.sh(?:\s|$)/i.test(
      command,
    )
  ) {
    return "init.sh must be executed exactly as ./init.sh";
  }

  if (
    /(^|[;&|]\s*|\s)(?:\S*php\S*\s+)?(?:\S*\/)?artisan(?:\s|$)/i.test(command)
  ) {
    return "Artisan commands are not allowed";
  }

  if (
    /(^|[;&|]\s*|\s)(?:\S*\/)?(?:mysql|mariadb|psql|sqlite3|mongosh|redis-cli)(?:\s|$)/i.test(
      command,
    )
  ) {
    return "Direct database clients are not allowed";
  }

  return null;
};

export const BlockUnsafeCommands = async () => ({
  "tool.execute.before": async (input, output) => {
    if (
      (input.tool === "read" || input.tool === "edit") &&
      isProtectedEnvFile(output.args.filePath ?? output.args.path)
    ) {
      throw new Error(
        "BLOCKED: AI agents are not allowed to read or modify environment files.",
      );
    }

    if (input.tool !== "bash") {
      return;
    }

    const reason = blockedCommand(normalizeCommand(output.args.command));

    if (reason) {
      throw new Error(
        `BLOCKED: ${reason}. Run the command manually outside OpenCode.`,
      );
    }
  },
});
