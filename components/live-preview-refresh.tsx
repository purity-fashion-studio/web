"use client"

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react"
import { useRouter } from "next/navigation"

export function LivePreviewRefresh({ serverURL }: { serverURL: string }) {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      serverURL={new URL(serverURL).origin}
      refresh={() => router.refresh()}
    />
  )
}
