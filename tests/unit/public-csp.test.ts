import { afterEach, expect, it, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"

vi.mock("next-intl/middleware", () => ({
  default: () => () => NextResponse.next(),
}))

afterEach(() => vi.unstubAllEnvs())

async function policy(mode: "development" | "production") {
  vi.stubEnv("NODE_ENV", mode)
  vi.stubEnv("PAYLOAD_ENABLED", "false")
  const { default: proxy } = await import("@/proxy")
  return (await proxy(new NextRequest("http://localhost:3102/uk"))).headers.get(
    "Content-Security-Policy"
  )!
}

it("permits the pinned Next development overlay stylesheet without permitting arbitrary inline styles", async () => {
  const csp = await policy("development")
  const styles = csp.split("; ").find((part) => part.startsWith("style-src "))!
  expect(styles).toContain(
    "'sha256-4GzqRlwcGp7cD3kANBs5f/CO/iqLwfJq0WYAq59xN6E='"
  )
  expect(styles).not.toContain("'unsafe-inline'")
  expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/)
})

it("keeps production styles nonce-bound and scripts protected", async () => {
  const csp = await policy("production")
  const styles = csp.split("; ").find((part) => part.startsWith("style-src "))!
  expect(styles).toMatch(/^style-src 'self' 'nonce-[^']+'$/)
  expect(csp).not.toContain("sha256-")
  expect(csp).not.toContain("unsafe-eval")
  expect(
    csp.split("; ").find((part) => part.startsWith("script-src "))
  ).not.toContain("unsafe-inline")
})
