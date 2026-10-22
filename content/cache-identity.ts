import { createHash } from "node:crypto"

export function contentCacheIdentity({
  databaseURL,
  localMedia,
  deploymentKey = "local",
}: {
  databaseURL?: string
  localMedia: boolean
  deploymentKey?: string
}) {
  const database = databaseURL ? new URL(databaseURL) : undefined
  const identity = JSON.stringify([
    database?.hostname,
    database?.port,
    database?.pathname,
    localMedia,
  ])
  // Earlier views contain static /media paths; they must not survive the move
  // to Payload's access-controlled upload delivery, including local rebuilds.
  return `purity-payload-cache-v5:${deploymentKey}:${createHash("sha256").update(identity).digest("hex").slice(0, 20)}`
}
