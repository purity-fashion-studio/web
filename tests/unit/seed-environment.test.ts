import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { expect, it } from "vitest"

it("validates dotenv-only configuration before constructing the CMS client", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "seed-env-"))
  try {
    writeFileSync(
      path.join(directory, ".env"),
      "PAYLOAD_ENABLED=false\nNEXT_PUBLIC_SITE_URL=dotenv-invalid-url\nDATABASE_URL=postgresql://fixture:fixture@127.0.0.1/fixture\n"
    )
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        path.resolve("node_modules/tsx/dist/loader.mjs"),
        path.resolve("payload/seed/import-seed.ts"),
        "--verify",
        "--target=local",
      ],
      {
        cwd: directory,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: "test",
          TSX_TSCONFIG_PATH: path.resolve("tsconfig.json"),
        },
        encoding: "utf8",
        timeout: 20000,
      }
    )
    expect(result.status).toBe(1)
    expect(result.stderr).toContain("Invalid URL")
    expect(result.stderr).toContain("NEXT_PUBLIC_SITE_URL")
    expect(result.stderr).not.toContain("Set PAYLOAD_ENABLED=true")
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
