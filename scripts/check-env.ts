import nextEnv from "@next/env"

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const { env } = await import("../lib/env")

console.log(`Environment ok: ${env.NEXT_PUBLIC_SITE_URL}`)
