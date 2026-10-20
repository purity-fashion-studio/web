import type { MetadataRoute } from "next"

import { env } from "@/lib/env"
import { getSiteURL } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  if (env.NEXT_PUBLIC_INDEXING_ENABLED !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/*/payment"],
    },
    sitemap: `${getSiteURL()}/sitemap.xml`,
  }
}
