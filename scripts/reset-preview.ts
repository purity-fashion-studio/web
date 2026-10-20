import { spawnSync } from "node:child_process"

import { assertTargetResourceIdentity } from "./resource-identity"

if (process.env.ALLOW_CMS_RESET !== "true") {
  throw new Error("Preview reset requires ALLOW_CMS_RESET=true.")
}
if (!process.argv.includes("--confirm=RESET_PREVIEW")) {
  throw new Error("Confirm Preview reset with --confirm=RESET_PREVIEW.")
}

assertTargetResourceIdentity("preview")

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

await import("./reset-preview-blob")
run("pnpm", ["payload", "migrate:fresh", "--force-accept-warning"])
