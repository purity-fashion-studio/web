import { expect, it } from "vitest"
import config from "@/payload.config"

it("does not expose an unbounded alternate Payload job runner to CMS roles", async () => {
  const sanitized = await config
  const run = sanitized.jobs.access?.run
  if (!run) throw new Error("Missing jobs access policy")
  for (const role of [
    undefined,
    "owner",
    "editor",
    "support",
    "finance",
    "developer",
  ]) {
    expect(
      await run({
        req: { user: role ? { roles: [role], active: true } : undefined },
      } as never)
    ).toBe(false)
  }
})
