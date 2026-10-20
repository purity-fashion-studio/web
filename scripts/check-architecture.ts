import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

const sourceRoots = ["app", "components", "features", "lib"]
const issues: string[] = []

function listSourceFiles(root: string): string[] {
  if (!existsSync(root)) {
    return []
  }

  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    const stat = statSync(path)

    return stat.isDirectory()
      ? listSourceFiles(path)
      : /\.(css|ts|tsx)$/.test(path)
        ? [path]
        : []
  })
}

const forbiddenImports = [
  ["lucide-react", "Use Phosphor icons from the active shadcn preset."],
  ["next-themes", "PURITY uses one canonical semantic theme."],
  [
    "components/ui/button-variants",
    "Use the canonical button contract from components/ui/button.tsx.",
  ],
] as const

const forbiddenPayloadRuntimeReferences = [
  "content/data",
  "content/source",
  "content/category-page-specs",
  "content/service-page-specs",
  "content/collection-page-specs",
  "content/home-page-spec",
  "content/portfolio-page-spec",
  "CONTENT_SOURCE",
  "ContentSnapshot",
] as const

const removedLegacyContentFiles = [
  "content/category-page-specs.ts",
  "content/cms.ts",
  "content/collection-page-specs.ts",
  "content/course-page-spec.ts",
  "content/data.ts",
  "content/home-page-spec.ts",
  "content/legacy-routes.ts",
  "content/model.ts",
  "content/portfolio-page-spec.ts",
  "content/service-page-specs.ts",
  "scripts/export-cms-seed.ts",
] as const

for (const file of sourceRoots.flatMap(listSourceFiles)) {
  const source = readFileSync(file, "utf8")

  for (const [pattern, guidance] of forbiddenImports) {
    if (source.includes(pattern)) {
      issues.push(
        `${file}: forbidden architecture import ${pattern}. ${guidance}`
      )
    }
  }

  for (const reference of forbiddenPayloadRuntimeReferences) {
    if (source.includes(reference)) {
      issues.push(
        `${file}: public runtime must read business content from Payload, not ${reference}.`
      )
    }
  }
}

for (const file of removedLegacyContentFiles) {
  if (existsSync(file)) {
    issues.push(`${file}: obsolete static content source must remain deleted.`)
  }
}

for (const file of [
  "content/public-api.ts",
  "content/routes.ts",
  "content/metadata.ts",
  "proxy.ts",
]) {
  const source = readFileSync(file, "utf8")
  for (const reference of forbiddenPayloadRuntimeReferences) {
    if (source.includes(reference)) {
      issues.push(
        `${file}: Payload runtime must not reference static migration content (${reference}).`
      )
    }
  }
}

for (const file of ["payload/seed/import-seed.ts"]) {
  const source = readFileSync(file, "utf8")
  for (const reference of [
    ...forbiddenPayloadRuntimeReferences.slice(0, 7),
    "features/booking/content",
  ]) {
    if (source.includes(reference)) {
      issues.push(
        `${file}: the deterministic importer must consume the versioned manifest, not ${reference}.`
      )
    }
  }
}

if (existsSync("components/ui/button-variants.ts")) {
  issues.push(
    "components/ui/button-variants.ts must not return; components/ui/button.tsx is canonical."
  )
}

const componentsConfig = JSON.parse(
  readFileSync("components.json", "utf8")
) as {
  style?: string
  iconLibrary?: string
  tailwind?: { baseColor?: string }
}

if (
  componentsConfig.style !== "base-sera" ||
  componentsConfig.iconLibrary !== "phosphor" ||
  componentsConfig.tailwind?.baseColor !== "neutral"
) {
  issues.push(
    "components.json drifted from the Base Sera/neutral/Phosphor contract."
  )
}

const e2e = readFileSync("tests/e2e/purity.spec.ts", "utf8")
for (const required of [
  "[320, 375, 768, 1024, 1440, 1920]",
  '"uk", "ru", "en"',
  'const colorSchemes = ["light"] as const',
  "page.screenshot()",
  "scrollWidth",
]) {
  if (!e2e.includes(required)) {
    issues.push(
      `tests/e2e/purity.spec.ts is missing the required QA matrix contract: ${required}`
    )
  }
}

if (issues.length) {
  throw new Error(`Architecture QA failed:\n${issues.join("\n")}`)
}

console.log(
  "Architecture QA ok: Base UI, Phosphor, single-theme ownership, and responsive matrix contracts are intact"
)
