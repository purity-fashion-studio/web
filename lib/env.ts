import { z } from "zod"

import { assertDeploymentPolicy } from "./env-policy"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  SITE_MODE: z.enum(["preview", "production"]).default("production"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_PAYLOAD_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_INDEXING_ENABLED: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_ANALYTICS_ENABLED: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_GA4_ID: z
    .string()
    .regex(/^G-[A-Z0-9]+$/)
    .optional(),
  PAYLOAD_ENABLED: z.enum(["true", "false"]).default("false"),
  PAYLOAD_SECRET: z.string().optional(),
  PREVIEW_SECRET: z.string().optional(),
  DATABASE_URL: z.string().url().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  PAYLOAD_DISABLE_BLOB_STORAGE: z.enum(["true", "false"]).default("false"),
  EMAIL_MODE: z.enum(["resend", "offline", "disabled"]).default("resend"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_OVERRIDE_RECIPIENT: z.string().email().optional(),
  RESEND_DOMAIN_VERIFIED: z.enum(["true", "false"]).default("false"),
  CRON_SECRET: z.string().min(32).optional(),
  PAYMENT_MODE: z.enum(["test", "live"]).default("test"),
  PAYMENT_MERCHANT_READY: z.enum(["true", "false"]).default("false"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  LIQPAY_PUBLIC_KEY: z.string().optional(),
  LIQPAY_PRIVATE_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  throw new Error(z.prettifyError(parsed.error))
}

if (parsed.data.SITE_MODE === "preview") {
  if (parsed.data.EMAIL_MODE !== "disabled") {
    throw new Error("SITE_MODE=preview requires EMAIL_MODE=disabled")
  }
} else if (parsed.data.EMAIL_MODE === "disabled") {
  throw new Error("EMAIL_MODE=disabled requires SITE_MODE=preview")
}

if (parsed.data.EMAIL_MODE === "offline") {
  const localURL = (value: string) => {
    const url = new URL(value)
    return (
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
  }
  if (
    parsed.data.NODE_ENV === "production" ||
    parsed.data.VERCEL_ENV !== undefined ||
    !localURL(parsed.data.NEXT_PUBLIC_SITE_URL) ||
    !localURL(parsed.data.NEXT_PUBLIC_PAYLOAD_URL) ||
    parsed.data.PAYMENT_MODE !== "test"
  ) {
    throw new Error(
      "Offline email is restricted to local development/test without a deployment environment"
    )
  }
}

if (parsed.data.PAYLOAD_DISABLE_BLOB_STORAGE === "true") {
  const localURL = (value: string) => {
    const url = new URL(value)
    return (
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
  }
  if (
    parsed.data.VERCEL_ENV !== undefined ||
    !localURL(parsed.data.NEXT_PUBLIC_SITE_URL) ||
    !localURL(parsed.data.NEXT_PUBLIC_PAYLOAD_URL)
  ) {
    throw new Error(
      "Local media storage requires loopback URLs and no deployment environment"
    )
  }
}

if (parsed.data.PAYLOAD_ENABLED === "true") {
  const missing = [
    ["PAYLOAD_SECRET", parsed.data.PAYLOAD_SECRET],
    ["PREVIEW_SECRET", parsed.data.PREVIEW_SECRET],
    ["DATABASE_URL", parsed.data.DATABASE_URL],
    ...(parsed.data.EMAIL_MODE === "resend"
      ? [["RESEND_API_KEY", parsed.data.RESEND_API_KEY]]
      : []),
    ...(parsed.data.EMAIL_MODE !== "disabled"
      ? [["EMAIL_FROM", parsed.data.EMAIL_FROM]]
      : []),
    ...(parsed.data.NODE_ENV === "production"
      ? [["CRON_SECRET", parsed.data.CRON_SECRET]]
      : []),
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length) {
    throw new Error(`Missing Payload runtime variables: ${missing.join(", ")}`)
  }

  if ((parsed.data.PAYLOAD_SECRET?.length ?? 0) < 32) {
    throw new Error("PAYLOAD_SECRET must contain at least 32 characters")
  }

  if ((parsed.data.PREVIEW_SECRET?.length ?? 0) < 32) {
    throw new Error("PREVIEW_SECRET must contain at least 32 characters")
  }

  if (
    parsed.data.EMAIL_MODE === "resend" &&
    parsed.data.VERCEL_ENV === "preview" &&
    !parsed.data.EMAIL_OVERRIDE_RECIPIENT
  ) {
    throw new Error("EMAIL_OVERRIDE_RECIPIENT is required in Vercel Preview")
  }

  if (parsed.data.VERCEL_ENV === "production") {
    if (parsed.data.EMAIL_OVERRIDE_RECIPIENT) {
      throw new Error("EMAIL_OVERRIDE_RECIPIENT must be unset in Production")
    }
    if (
      parsed.data.EMAIL_MODE === "resend" &&
      parsed.data.RESEND_DOMAIN_VERIFIED !== "true"
    ) {
      throw new Error("RESEND_DOMAIN_VERIFIED must be true in Production")
    }
  }

  if (
    parsed.data.NODE_ENV === "production" &&
    parsed.data.PAYLOAD_DISABLE_BLOB_STORAGE !== "true"
  ) {
    const missingStorage = [
      ["BLOB_READ_WRITE_TOKEN", parsed.data.BLOB_READ_WRITE_TOKEN],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key)

    if (missingStorage.length) {
      throw new Error(
        `Missing Vercel Blob media variables: ${missingStorage.join(", ")}`
      )
    }
  }
}

assertDeploymentPolicy({
  siteMode: parsed.data.SITE_MODE,
  analyticsEnabled: parsed.data.NEXT_PUBLIC_ANALYTICS_ENABLED,
  nodeEnv: parsed.data.NODE_ENV,
  vercelEnv: parsed.data.VERCEL_ENV,
  paymentMode: parsed.data.PAYMENT_MODE,
  indexingEnabled: parsed.data.NEXT_PUBLIC_INDEXING_ENABLED,
  siteURL: parsed.data.NEXT_PUBLIC_SITE_URL,
  payloadURL: parsed.data.NEXT_PUBLIC_PAYLOAD_URL,
})

if (parsed.data.PAYMENT_MODE === "live") {
  const missing = [
    ["STRIPE_SECRET_KEY", parsed.data.STRIPE_SECRET_KEY],
    ["STRIPE_WEBHOOK_SECRET", parsed.data.STRIPE_WEBHOOK_SECRET],
    ["LIQPAY_PUBLIC_KEY", parsed.data.LIQPAY_PUBLIC_KEY],
    ["LIQPAY_PRIVATE_KEY", parsed.data.LIQPAY_PRIVATE_KEY],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length) {
    throw new Error(`Missing live payment secrets: ${missing.join(", ")}`)
  }

  if (parsed.data.PAYMENT_MERCHANT_READY !== "true") {
    throw new Error("PAYMENT_MERCHANT_READY must be true in live payment mode")
  }
}

if (
  parsed.data.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" &&
  !parsed.data.NEXT_PUBLIC_GA4_ID
) {
  throw new Error("NEXT_PUBLIC_GA4_ID is required when analytics is enabled")
}

export const env = parsed.data
