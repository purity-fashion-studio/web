import { checkReadiness } from "@/lib/readiness"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await checkReadiness()
    return Response.json(
      { status: "ok", content: "payload" },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    const check =
      error instanceof Error && /^[a-z-]+$/.test(error.message)
        ? error.message
        : "unknown"
    return Response.json(
      { status: "unavailable", check },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
