import { draftMode } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const draft = await draftMode()
  draft.disable()

  const requestURL = new URL(request.url)
  return NextResponse.redirect(new URL("/uk", requestURL.origin), 303)
}
