import { spawnSync } from "node:child_process"

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    env: process.env,
    stdio: "inherit",
  })
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with status ${result.status}`
    )
  }
}

run("pnpm", ["content:manifest:verify"])
run("pnpm", ["build"])
