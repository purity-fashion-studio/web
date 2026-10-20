import { copyFileSync, existsSync } from "node:fs"

const shadcnCommand =
  "pnpm dlx shadcn@latest apply --preset b59jufTOPg --yes"

if (!existsSync(".env.local") && existsSync(".env.example")) {
  copyFileSync(".env.example", ".env.local")
  console.log("Created .env.local from .env.example")
}

console.log(`shadcn baseline: ${shadcnCommand}`)
console.log("Run pnpm readiness:mvp before handing off foundation changes.")
