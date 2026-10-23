import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from "@payloadcms/next/routes"
import config from "@payload-config"
import "@payloadcms/next/css"

const payloadGET = REST_GET(config)
export const GET: typeof payloadGET = async (request, context) => {
  const response = await payloadGET(request, context)
  const { slug } = await context.params
  if (slug?.[0] === "media") {
    // Apply to successes, conditional/range responses and ACL denials alike.
    // Public Blob's own URL/cache is a separate provider boundary.
    response.headers.set("Cache-Control", "private, no-store, max-age=0")
    response.headers.set("CDN-Cache-Control", "no-store")
    response.headers.set("Vercel-CDN-Cache-Control", "no-store")
  }
  return response
}
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
