import { existsSync, readFileSync } from "node:fs"

const requiredFiles = [
  "docs/launch-handoff.md",
  "docs/cms-payload-plan.md",
  "docs/qa-checklist.md",
  "docs/operations-runbook.md",
  ".env.example",
]

const requiredSections = [
  "Production Deployment",
  "Environment and Secrets",
  "Payment Activation",
  "CMS Activation",
  "Real Media Replacement",
  "Editable Now",
  "Editable After CMS Activation",
  "Future Backlog",
]

const issues: string[] = []

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    issues.push(`Missing handoff file: ${file}`)
  }
}

if (existsSync("docs/launch-handoff.md")) {
  const handoff = readFileSync("docs/launch-handoff.md", "utf8")

  for (const section of requiredSections) {
    if (!handoff.includes(`## ${section}`)) {
      issues.push(`Missing handoff section: ${section}`)
    }
  }
}

if (existsSync(".env.example")) {
  const envExample = readFileSync(".env.example", "utf8")

  for (const key of [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_INDEXING_ENABLED",
    "PAYLOAD_ENABLED",
    "PAYLOAD_SECRET",
    "DATABASE_URL",
    "RESEND_API_KEY",
    "PAYMENT_MODE",
    "PAYMENT_MERCHANT_READY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "LIQPAY_PRIVATE_KEY",
  ]) {
    if (!envExample.includes(key)) {
      issues.push(`Missing env example key: ${key}`)
    }
  }
}

if (issues.length) {
  throw new Error(`Launch handoff invalid:\n${issues.join("\n")}`)
}

console.log("Launch handoff ok")
