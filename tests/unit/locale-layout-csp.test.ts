import { CSPProvider } from "@base-ui/react/csp-provider"
import * as React from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

const request = vi.hoisted(() => ({ nonce: undefined as string | undefined }))
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers(request.nonce ? { "x-nonce": request.nonce } : {}),
}))
vi.mock("next/font/google", () => ({
  Noto_Sans: () => ({ variable: "--font-sans" }),
  Noto_Serif: () => ({ variable: "--font-heading" }),
}))
vi.mock("@/content/public-api", () => ({
  getSiteSettings: async () => ({
    canonicalOrigin: "http://localhost:3000",
    contacts: { email: "studio@example.com", phone: "+380000000000" },
  }),
}))
vi.mock("@/lib/env", () => ({ env: {} }))

import LocaleLayout from "@/app/[locale]/layout"
import { Analytics } from "@/components/analytics"
import { DocumentCSPProvider } from "@/components/document-csp-provider"
import { StructuredData } from "@/components/structured-data"

type TreeElement = React.ReactElement<{
  children?: React.ReactNode
  nonce?: string
}>

function descendants(node: React.ReactNode): TreeElement[] {
  return React.Children.toArray(node).flatMap((child) =>
    React.isValidElement<TreeElement["props"]>(child)
      ? [child, ...descendants(child.props.children)]
      : []
  )
}

// Resolve the public nonce boundary, but keep the actual canonical provider.
// Calling a fresh boundary for every tree also models root-layout remounts.
function publicProvider(tree: React.ReactNode, child: React.ReactNode) {
  const boundaries = descendants(tree).filter(
    (node) => node.type === DocumentCSPProvider
  )
  expect(boundaries).toHaveLength(1)
  const boundary = boundaries[0]!
  expect(boundary.props.children).toBe(child)
  const provider = DocumentCSPProvider({
    children: boundary.props.children,
    nonce: boundary.props.nonce,
  })
  expect(provider.type).toBe(CSPProvider)
  return provider
}

async function renderPublicProvider(nonce: string | undefined, locale = "en") {
  request.nonce = nonce
  const child = React.createElement("main", { id: "public-child" })
  const tree = await LocaleLayout({
    params: Promise.resolve({ locale }),
    children: child,
  })
  return publicProvider(tree, child)
}

beforeEach(() => vi.stubGlobal("React", React))
afterEach(() => {
  request.nonce = undefined
  vi.unstubAllGlobals()
})

it.each(["uk", "ru", "en"])(
  "provides the current request nonce to the real Base UI provider enclosing public children in %s",
  async (locale) => {
    const child = React.createElement("main", { id: "public-child" })
    for (const nonce of [
      "first-request-nonce",
      "next-request-nonce",
      undefined,
    ]) {
      request.nonce = nonce
      const tree = await LocaleLayout({
        params: Promise.resolve({ locale }),
        children: child,
      })
      const nodes = descendants(tree)
      const provider = publicProvider(tree, child)
      expect(provider.props.nonce).toBe(nonce)
      expect(
        descendants(provider.props.children).some(
          (node) => node.type === child.type && node.props === child.props
        )
      ).toBe(true)
      for (const component of [StructuredData, Analytics]) {
        const script = nodes.find((node) => node.type === component)
        expect(script).toBeDefined()
        expect(script?.props.nonce).toBe(nonce)
      }
    }
  }
)

it("uses the HTML document nonce for the first popup after an RSC refresh", async () => {
  const querySelector = vi.fn(() => ({ nonce: "html-document-nonce" }))
  vi.stubGlobal("document", { querySelector })

  // There need not have been a popup/provider mount before the refresh.
  const provider = await renderPublicProvider("refreshed-rsc-nonce")
  expect(provider.props.nonce).toBe("html-document-nonce")
  expect(querySelector).toHaveBeenCalledWith("script[src][nonce]")
})

it("retains the nonce across fresh provider instances and locale-root remounts in one document", async () => {
  const querySelector = vi.fn(() => ({ nonce: "document-a" }))
  vi.stubGlobal("document", { querySelector })
  expect((await renderPublicProvider("request-a", "en")).props.nonce).toBe(
    "document-a"
  )

  // Layout-owned nodes may change; document-lifetime state must not depend on
  // a React instance or assume that [locale] preserves the client boundary.
  querySelector.mockReturnValue({ nonce: "later-rsc-nonce" })
  for (const locale of ["uk", "ru", "en"]) {
    expect(
      (await renderPublicProvider("later-rsc-nonce", locale)).props.nonce
    ).toBe("document-a")
  }
  expect(querySelector).toHaveBeenCalledTimes(1)
})

it("accepts a new nonce on a true document replacement, without leaking between documents or SSR requests", async () => {
  const firstDocument = {
    querySelector: vi.fn(() => ({ nonce: "document-a" })),
  }
  vi.stubGlobal("document", firstDocument)
  expect((await renderPublicProvider("request-a")).props.nonce).toBe(
    "document-a"
  )

  vi.stubGlobal("document", {
    querySelector: vi.fn(() => ({ nonce: "document-b" })),
  })
  expect((await renderPublicProvider("request-b")).props.nonce).toBe(
    "document-b"
  )

  vi.stubGlobal("document", firstDocument)
  expect((await renderPublicProvider("request-c")).props.nonce).toBe(
    "document-a"
  )
  vi.unstubAllGlobals()
  vi.stubGlobal("React", React)
  expect((await renderPublicProvider("ssr-a")).props.nonce).toBe("ssr-a")
  expect((await renderPublicProvider("ssr-b")).props.nonce).toBe("ssr-b")
})

it.each([undefined, "fallback-nonce"])(
  "keeps the initial fallback %s if the document has no nonce-bearing bootstrap script",
  async (nonce) => {
    const querySelector = vi.fn(() => null)
    vi.stubGlobal("document", { querySelector })
    expect((await renderPublicProvider(nonce)).props.nonce).toBe(nonce)
    expect((await renderPublicProvider("later-rsc")).props.nonce).toBe(nonce)
    expect(querySelector).toHaveBeenCalledTimes(1)
  }
)
