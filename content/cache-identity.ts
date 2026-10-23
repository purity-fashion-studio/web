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
  // Retire views with provider URLs as well as old static local media paths.
  return `purity-payload-cache-v6:${deploymentKey}:${createHash("sha256").update(identity).digest("hex").slice(0, 20)}`
}
