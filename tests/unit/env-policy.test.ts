import { describe, expect, it } from "vitest"

import { assertDeploymentPolicy } from "@/lib/env-policy"

const local = {
  nodeEnv: "development" as const,
  vercelEnv: undefined,
  paymentMode: "test" as const,
  indexingEnabled: "false" as const,
  siteURL: "http://localhost:3000",
  payloadURL: "http://localhost:3000",
}

const explicitPreview = {
  ...local,
  siteMode: "preview" as const,
  nodeEnv: "production" as const,
  vercelEnv: "production" as const,
  analyticsEnabled: "false" as const,
  siteURL: "https://purity-fashion-studio.vercel.app",
  payloadURL: "https://purity-fashion-studio.vercel.app",
}

describe("explicit development-preview policy", () => {
  it("permits the exact stable development origin on the production target", () => {
    expect(() => assertDeploymentPolicy(explicitPreview)).not.toThrow()
  })

  it.each([
    "http://localhost:3000",
    "http://127.0.0.1:3102",
    "https://[::1]:3000",
  ])("permits loopback preview builds: %s", (url) => {
    expect(() =>
      assertDeploymentPolicy({
        ...explicitPreview,
        vercelEnv: undefined,
        siteURL: url,
        payloadURL: url,
      })
    ).not.toThrow()
  })

  it.each([
    ["paymentMode", "live", /PAYMENT_MODE=test/],
    ["indexingEnabled", "true", /NEXT_PUBLIC_INDEXING_ENABLED=false/],
    ["analyticsEnabled", "true", /NEXT_PUBLIC_ANALYTICS_ENABLED=false/],
  ] as const)("rejects unsafe %s", (key, value, error) => {
    expect(() =>
      assertDeploymentPolicy({
        ...explicitPreview,
        [key]: value,
      })
    ).toThrow(error)
  })

  it.each([
    "https://purity-fashion-studio.ua",
    "https://arbitrary.example",
    "https://purity-fashion-studio-git-main.vercel.app",
    "https://purity-fashion-studio.vercel.app.evil.example",
    "http://purity-fashion-studio.vercel.app",
    "https://purity-fashion-studio.vercel.app:8443",
    "https://user:pass@purity-fashion-studio.vercel.app",
    "https://purity-fashion-studio.vercel.app/path",
    "https://purity-fashion-studio.vercel.app?query=1",
    "https://purity-fashion-studio.vercel.app#hash",
    "http://localhost.evil.example",
    "http://user@localhost:3000",
    "ftp://127.0.0.1",
    "http://192.168.1.1",
    "not-a-url",
  ])("rejects disallowed preview origin %s for both public URLs", (url) => {
    for (const key of ["siteURL", "payloadURL"] as const) {
      expect(() =>
        assertDeploymentPolicy({
          ...explicitPreview,
          [key]: url,
        })
      ).toThrow(
        /must be a loopback URL or https:\/\/purity-fashion-studio.vercel.app/
      )
    }
  })

  it("does not permit the dev origin in commercial production", () => {
    expect(() =>
      assertDeploymentPolicy({
        ...explicitPreview,
        siteMode: "production",
        paymentMode: "live",
      })
    ).toThrow(/must be https:\/\/purity-fashion-studio.ua in Production/)
  })
})

describe("deployment environment policy", () => {
  it("keeps preview deployments non-paying and non-indexable", () => {
    expect(() =>
      assertDeploymentPolicy({
        ...local,
        nodeEnv: "production",
        vercelEnv: "preview",
      })
    ).not.toThrow()

    expect(() =>
      assertDeploymentPolicy({
        ...local,
        nodeEnv: "production",
        vercelEnv: "preview",
        paymentMode: "live",
      })
    ).toThrow(/PAYMENT_MODE=test/)

    expect(() =>
      assertDeploymentPolicy({
        ...local,
        nodeEnv: "production",
        vercelEnv: "preview",
        indexingEnabled: "true",
      })
    ).toThrow(/NEXT_PUBLIC_INDEXING_ENABLED=false/)
  })

  it("requires the canonical HTTPS origin for production", () => {
    expect(() =>
      assertDeploymentPolicy({
        ...local,
        nodeEnv: "production",
      })
    ).not.toThrow()

    expect(() =>
      assertDeploymentPolicy({
        ...local,
        nodeEnv: "production",
        vercelEnv: undefined,
        siteURL: "https://preview.example",
        payloadURL: "https://preview.example",
      })
    ).toThrow(/PAYMENT_MODE=live/)

    expect(() =>
      assertDeploymentPolicy({
        ...local,
        vercelEnv: "production",
      })
    ).toThrow(/PAYMENT_MODE=live/)

    expect(() =>
      assertDeploymentPolicy({
        ...local,
        vercelEnv: "production",
        paymentMode: "live",
      })
    ).toThrow(/NEXT_PUBLIC_SITE_URL/)

    expect(() =>
      assertDeploymentPolicy({
        nodeEnv: "production",
        vercelEnv: "production",
        paymentMode: "live",
        indexingEnabled: "true",
        siteURL: "https://user:pass@purity-fashion-studio.ua",
        payloadURL: "https://purity-fashion-studio.ua",
      })
    ).toThrow(/NEXT_PUBLIC_SITE_URL/)

    expect(() =>
      assertDeploymentPolicy({
        nodeEnv: "production",
        vercelEnv: "production",
        paymentMode: "live",
        indexingEnabled: "true",
        siteURL: "https://purity-fashion-studio.ua",
        payloadURL: "https://purity-fashion-studio.ua/",
      })
    ).not.toThrow()
  })
})
