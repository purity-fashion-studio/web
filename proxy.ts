import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"

import { routing } from "./i18n/routing"
import { getPayloadURL } from "./lib/site-url"
import { nextDevelopmentStyleHashes } from "./lib/next-development-style-hashes"

const handleI18n = createMiddleware(routing)

function securityPolicy(nonce: string) {
  const previewLiveFeedbackOrigin =
    process.env.VERCEL_ENV === "preview" ? " https://vercel.live" : ""
  const developmentUnsafeEval =
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com${previewLiveFeedbackOrigin}${developmentUnsafeEval}`,
    `style-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV === "development" ? ` ${nextDevelopmentStyleHashes}` : ""}`,
    // Next/Image emits inline style attributes for responsive sizing. Keep
    // executable styles nonce-bound while allowing those element attributes.
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
    `frame-src 'self' https://www.google.com https://www.openstreetmap.org${previewLiveFeedbackOrigin}`,
    "form-action 'self' https://checkout.stripe.com https://www.liqpay.ua https://pay.fondy.eu",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ].join("; ")
}

function adminSecurityPolicy() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-src 'self' https:",
    "form-action 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ].join("; ")
}

type RedirectDocument = {
  from: string
  type: "301" | "302"
  to?: {
    type?: "reference" | "custom" | null
    url?: string | null
    reference?: {
      relationTo: string
      value: { slug?: string | null } | string
    } | null
  }
}

let redirectCache:
  { expiresAt: number; documents: RedirectDocument[] } | undefined

function referencePath(document: RedirectDocument, locale: string) {
  const reference = document.to?.reference
  if (!reference || typeof reference.value === "string") return null
  const slug = reference.value.slug
  if (!slug) return null
  const prefixes: Record<string, string> = {
    directions: "",
    services: "/services",
    courses: "/courses",
    "fashion-collections": "/collections",
    "portfolio-cases": "/portfolio",
    pages: "",
  }
  const prefix = prefixes[reference.relationTo]
  return prefix === undefined ? null : `/${locale}${prefix}/${slug}`
}

async function getRedirects() {
  if (process.env.PAYLOAD_ENABLED !== "true") return []
  if (redirectCache && redirectCache.expiresAt > Date.now()) {
    return redirectCache.documents
  }
  try {
    const url = new URL("/api/redirects", getPayloadURL())
    url.searchParams.set("depth", "1")
    url.searchParams.set("limit", "1000")
    url.searchParams.set("pagination", "false")
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "x-purity-internal": "redirect-resolution" },
    })
    if (!response.ok) return []
    const result = (await response.json()) as { docs?: RedirectDocument[] }
    const documents = result.docs ?? []
    redirectCache = { documents, expiresAt: Date.now() + 60_000 }
    return documents
  } catch {
    return []
  }
}

export default async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const csp = securityPolicy(nonce)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)
  const securedRequest = new NextRequest(request, { headers: requestHeaders })
  if (securedRequest.nextUrl.pathname.startsWith("/admin")) {
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    })
    response.headers.set("Content-Security-Policy", adminSecurityPolicy())
    return response
  }
  const documents = await getRedirects()
  const bySource = new Map(documents.map((item) => [item.from, item]))
  let document = bySource.get(securedRequest.nextUrl.pathname)

  if (document) {
    const locale = securedRequest.nextUrl.pathname.split("/")[1] || "uk"
    const visited = new Set([securedRequest.nextUrl.pathname])
    let destination =
      document.to?.type === "custom"
        ? document.to.url
        : referencePath(document, locale)

    for (let hop = 0; destination && hop < 5; hop += 1) {
      if (visited.has(destination)) {
        const response = await handleI18n(securedRequest)
        response.headers.set("Content-Security-Policy", csp)
        return response
      }
      visited.add(destination)
      const next = bySource.get(destination)
      if (!next) break
      document = next
      destination =
        next.to?.type === "custom" ? next.to.url : referencePath(next, locale)
    }

    if (destination?.startsWith("/") && !destination.startsWith("//")) {
      const target = new URL(destination, request.url)
      if (target.origin !== securedRequest.nextUrl.origin) {
        const response = await handleI18n(securedRequest)
        response.headers.set("Content-Security-Policy", csp)
        return response
      }
      if (!target.search && securedRequest.nextUrl.search) {
        target.search = securedRequest.nextUrl.search
      }
      return NextResponse.redirect(target, Number(document.type))
    }
  }

  const response = await handleI18n(securedRequest)
  response.headers.set("Content-Security-Policy", csp)
  return response
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
