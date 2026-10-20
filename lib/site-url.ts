import { env } from "@/lib/env"

function previewURL() {
  if (process.env.VERCEL_ENV !== "preview") return undefined
  const url = process.env.VERCEL_URL?.trim()
  if (!url) return undefined
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).origin
  } catch {
    return undefined
  }
}

export function getSiteURL() {
  return previewURL() ?? env.NEXT_PUBLIC_SITE_URL
}

export function getPayloadURL() {
  return (
    previewURL() ??
    process.env.NEXT_PUBLIC_PAYLOAD_URL?.trim() ??
    getSiteURL()
  )
}
