import { defineConfig, devices } from "@playwright/test"

if (
  process.env.NO_COLOR !== undefined &&
  process.env.FORCE_COLOR === undefined
) {
  delete process.env.NO_COLOR
  process.env.FORCE_COLOR = "0"
}

// Keep local and CI runs on Playwright's pinned browser. A system Chrome
// channel can reuse an existing macOS profile and leave streaming workers
// alive after the suite; callers can still opt in explicitly when needed.
const channel = process.env.PLAYWRIGHT_CHANNEL
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
const usesRemoteBaseURL = process.env.PLAYWRIGHT_BASE_URL !== undefined
const protectionBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  // CMS lifecycle files temporarily provision owners in the isolated database.
  // Keep the first-owner and role scenarios serialized in local runs and CI.
  workers: 1,
  ...(usesRemoteBaseURL
    ? {}
    : {
        webServer: {
          command: "pnpm start",
          url: `${baseURL}/uk`,
          reuseExistingServer:
            !process.env.CI && !process.env.PURITY_TEST_DATABASE,
          timeout: 60_000,
        },
      }),
  use: {
    baseURL,
    ...(protectionBypassSecret
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass": protectionBypassSecret,
          },
        }
      : {}),
    trace: "on-first-retry",
  },
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{platform}/{arg}{ext}",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(channel ? { channel } : {}),
      },
    },
  ],
})
