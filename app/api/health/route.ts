import { GET as readinessGET } from "./ready/route"

export const dynamic = "force-dynamic"

export function GET() {
  return readinessGET()
}
