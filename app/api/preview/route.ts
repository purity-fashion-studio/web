import { timingSafeEqual } from "node:crypto"
import { draftMode } from "next/headers"
import { NextResponse } from "next/server"

import { env } from "@/lib/env"

function matchesSecret(candidate: string | null) {
  if (!candidate || !env.PREVIEW_SECRET) return false

  const actual = Buffer.from(env.PREVIEW_SECRET)
  const supplied = Buffer.from(candidate)
  return actual.length === supplied.length && timingSafeEqual(actual, supplied)
}

function getSafePreviewURL(path: string | null, requestURL: string) {
  if (
    !path ||
    path.length > 500 ||
    !/^\/(uk|ru|en)(?:\/|$)/.test(path) ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(path)
  ) {
    return null
  }

  const request = new URL(requestURL)
  const target = new URL(path, request.origin)
  return target.origin === request.origin ? target : null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const target = getSafePreviewURL(url.searchParams.get("path"), request.url)

  if (!matchesSecret(url.searchParams.get("secret")) || !target) {
    return NextResponse.json(
      { error: "Invalid preview request" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  const draft = await draftMode()
  draft.enable()

  const response = NextResponse.redirect(target, 307)
  response.headers.set("Cache-Control", "private, no-store")
  return response
}
