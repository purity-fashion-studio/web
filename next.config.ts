import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { withPayload } from "@payloadcms/next/withPayload"

const productionDomainConfirmed = (() => {
  try {
    return (
      new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
        .hostname === "purity-fashion-studio.ua"
    )
  } catch {
    return false
  }
})()

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          ...(productionDomainConfirmed
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ]
  },
  images: {
    unoptimized: process.env.CI === "true",
    // The optimizer caches independently of Payload ACLs and ignores upstream
    // no-store. Validate before cache lookup: even old warmed CMS URLs must fail.
    // CMS uses its upload-time derivatives through the protected file endpoint.
    localPatterns: [{ pathname: "/brand/**", search: "" }],
    remotePatterns: [],
  },
}

const withNextIntl = createNextIntlPlugin()

export default withPayload(withNextIntl(nextConfig), {
  devBundleServerPackages: false,
})
