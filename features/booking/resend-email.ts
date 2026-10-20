import { Resend } from "resend"

import { env } from "@/lib/env"

const timeoutMs = 10_000

export async function sendOutboxEmail({
  deduplicationKey,
  recipient,
  subject,
  text,
}: {
  deduplicationKey: string
  recipient: string
  subject: string
  text: string
}) {
  if (env.EMAIL_MODE === "offline") {
    throw new Error("Email delivery disabled in offline mode")
  }
  if (env.EMAIL_MODE === "disabled") {
    throw new Error("Email delivery disabled in preview mode")
  }
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error("Resend is unavailable")
  }

  const resend = new Resend(env.RESEND_API_KEY)
  const request = resend.emails.send(
    {
      from: env.EMAIL_FROM,
      to: env.EMAIL_OVERRIDE_RECIPIENT ?? recipient,
      subject,
      text,
    },
    { idempotencyKey: deduplicationKey.slice(0, 256) }
  )
  let timeoutID: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutID = setTimeout(
      () => reject(new Error("Resend request timed out")),
      timeoutMs
    )
  })
  const result = await Promise.race([request, timeout]).finally(() => {
    if (timeoutID) clearTimeout(timeoutID)
  })
  if (result.error) {
    throw new Error(`Resend rejected the message: ${result.error.name}`)
  }
  if (!result.data?.id) throw new Error("Resend returned no message ID")
  return { id: result.data.id }
}
