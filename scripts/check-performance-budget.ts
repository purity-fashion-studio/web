import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const nextDir = ".next"
const publicManifestDir = join(nextDir, "server/app/[locale]")
const maxPublicJsBytes = 2_000_000

function files(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

if (!existsSync(publicManifestDir)) {
  throw new Error(
    "Missing production manifests. Run pnpm build before qa:budget."
  )
}

const manifests = files(publicManifestDir).filter((path) =>
  path.endsWith("client-reference-manifest.js")
)
const publicChunks = new Set<string>()
const chunkPattern =
  /\/?_next\/(static\/chunks\/[^"']+\.js)|"(static\/chunks\/[^"']+\.js)"/g

for (const manifest of manifests) {
  const source = readFileSync(manifest, "utf8")
  if (
    source.includes("node_modules/.pnpm/@payloadcms+") ||
    source.includes("/payload/dist/admin")
  ) {
    throw new Error(
      `Payload Admin code leaked into public route manifest: ${manifest}`
    )
  }
  for (const match of source.matchAll(chunkPattern)) {
    publicChunks.add(match[1] ?? match[2])
  }
}

const buildManifest = JSON.parse(
  readFileSync(join(nextDir, "build-manifest.json"), "utf8")
) as { polyfillFiles?: string[]; rootMainFiles?: string[] }
for (const path of [
  ...(buildManifest.polyfillFiles ?? []),
  ...(buildManifest.rootMainFiles ?? []),
]) {
  if (path.endsWith(".js")) publicChunks.add(path)
}

const total = [...publicChunks].reduce(
  (sum, path) => sum + statSync(join(nextDir, path)).size,
  0
)
if (total > maxPublicJsBytes) {
  throw new Error(
    `Public JS budget exceeded: ${total} bytes > ${maxPublicJsBytes} bytes`
  )
}

console.log(
  `Performance budget ok: ${total} public JS bytes across ${manifests.length} route manifests; Payload Admin isolated`
)
