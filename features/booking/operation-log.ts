import { randomUUID } from "node:crypto"

const correlationPattern = /^[a-zA-Z0-9_-]{8,128}$/

export function correlationID(request: Request) {
  const supplied = request.headers.get("x-correlation-id")
  return supplied && correlationPattern.test(supplied) ? supplied : randomUUID()
}
