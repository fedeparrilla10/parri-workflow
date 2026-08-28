export const BlockArtisanCommands = async () => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") {
        return
      }

      const command = String(output.args.command ?? "")
        .replace(/\\\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      if (/(^|[;&|]\s*|\s)(?:\S*php\S*\s+)?(?:\S*\/)?artisan(?:\s|$)/i.test(command)) {
        throw new Error(
          "BLOCKED: AI agents are not allowed to execute Artisan commands. Run the command manually outside OpenCode."
        )
      }
    },
  }
}