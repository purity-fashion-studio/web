const canonicalProductionOrigin = "https://purity-fashion-studio.ua"
const developmentPreviewOrigin = "https://purity-fashion-studio.vercel.app"

type DeploymentPolicyInput = {
  siteMode?: "preview" | "production"
  analyticsEnabled?: "true" | "false"
  nodeEnv: "development" | "test" | "production"
  vercelEnv: "development" | "preview" | "production" | undefined
  paymentMode: "test" | "live"
  indexingEnabled: "true" | "false"
  siteURL: string
  payloadURL: string
}

function isCanonicalProductionURL(value: string) {
  try {
    const url = new URL(value)
    return (
      url.origin === canonicalProductionOrigin &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password &&
      !url.port
    )
  } catch {
    return false
  }
}

function isLocalURL(value: string) {
  try {
    const url = new URL(value)
    return (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      (url.protocol === "http:" || url.protocol === "https:")
    )
  } catch {
    return false
  }
}

function isDevelopmentPreviewURL(value: string) {
  try {
    const url = new URL(value)
    const isLoopback =
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) &&
      ["http:", "https:"].includes(url.protocol)
    return (
      (isLoopback || url.origin === developmentPreviewOrigin) &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

export function assertDeploymentPolicy({
  siteMode = "production",
  analyticsEnabled = "false",
  nodeEnv,
  vercelEnv,
  paymentMode,
  indexingEnabled,
  siteURL,
  payloadURL,
}: DeploymentPolicyInput) {
  if (siteMode === "preview") {
    if (paymentMode !== "test") {
      throw new Error("SITE_MODE=preview requires PAYMENT_MODE=test")
    }
    if (indexingEnabled !== "false") {
      throw new Error(
        "SITE_MODE=preview requires NEXT_PUBLIC_INDEXING_ENABLED=false"
      )
    }
    if (analyticsEnabled !== "false") {
      throw new Error(
        "SITE_MODE=preview requires NEXT_PUBLIC_ANALYTICS_ENABLED=false"
      )
    }
    const invalidURL = [
      ["NEXT_PUBLIC_SITE_URL", siteURL],
      ["NEXT_PUBLIC_PAYLOAD_URL", payloadURL],
    ].find(([, value]) => !isDevelopmentPreviewURL(value))
    if (invalidURL) {
      throw new Error(
        `${invalidURL[0]} must be a loopback URL or ${developmentPreviewOrigin} in SITE_MODE=preview`
      )
    }
    return
  }

  if (vercelEnv === "preview") {
    if (paymentMode === "live") {
      throw new Error(
        "Vercel Preview deployments must keep PAYMENT_MODE=test; live payments require Production."
      )
    }
    if (indexingEnabled === "true") {
      throw new Error(
        "Vercel Preview deployments must keep NEXT_PUBLIC_INDEXING_ENABLED=false."
      )
    }
  }

  const isLocalBuild =
    vercelEnv === undefined && isLocalURL(siteURL) && isLocalURL(payloadURL)
  if (
    vercelEnv === "production" ||
    (vercelEnv === undefined && nodeEnv === "production" && !isLocalBuild)
  ) {
    if (paymentMode !== "live") {
      throw new Error(
        "Production deployments must set PAYMENT_MODE=live; test payments are not a launch mode."
      )
    }

    const invalidURL = [
      ["NEXT_PUBLIC_SITE_URL", siteURL],
      ["NEXT_PUBLIC_PAYLOAD_URL", payloadURL],
    ].find(([, value]) => !isCanonicalProductionURL(value))
    if (invalidURL) {
      throw new Error(
        `${invalidURL[0]} must be ${canonicalProductionOrigin} in Production`
      )
    }
  }
}
