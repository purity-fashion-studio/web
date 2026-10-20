import { createHash, randomUUID } from "node:crypto"
import { getPayload } from "payload"

import config from "@payload-config"
import { hasLocale } from "@/i18n/routing"
import { env } from "@/lib/env"
import { isPaymentAmountAllowed } from "@/lib/payment-limits"
import { getSiteURL } from "@/lib/site-url"

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

export async function GET(request: Request) {
  if (
    env.PAYMENT_MODE !== "live" ||
    !env.LIQPAY_PUBLIC_KEY ||
    !env.LIQPAY_PRIVATE_KEY
  ) {
    return Response.json({ error: "LiqPay is unavailable" }, { status: 503 })
  }
  const url = new URL(request.url)
  const orderUUID = url.searchParams.get("order")
  const rawLocale = url.searchParams.get("locale") ?? "uk"
  if (!orderUUID || !hasLocale(rawLocale)) {
    return Response.json({ error: "Invalid checkout request" }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: "payment-orders",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { orderUUID: { equals: orderUUID } },
  })
  const order = result.docs[0]
  if (
    !order ||
    order.provider !== "liqpay" ||
    order.mode !== "live" ||
    !isPaymentAmountAllowed(order.amount) ||
    !["created", "pending", "requires-action"].includes(order.status)
  ) {
    return Response.json({ error: "Checkout is unavailable" }, { status: 404 })
  }

  const origin = getSiteURL()
  const parameters = {
    version: 3,
    public_key: env.LIQPAY_PUBLIC_KEY,
    action: "pay",
    amount: (order.amount / 100).toFixed(2),
    currency: order.currency,
    description: order.commercialSnapshot.title.slice(0, 255),
    order_id: order.orderUUID,
    language: rawLocale === "ru" ? "ru" : rawLocale === "en" ? "en" : "uk",
    result_url: `${origin}/${rawLocale}/payment/success?order=${order.orderUUID}`,
    server_url: `${origin}/api/payments/webhooks/liqpay`,
  }
  const data = Buffer.from(JSON.stringify(parameters)).toString("base64")
  const signature = createHash("sha3-256")
    .update(`${env.LIQPAY_PRIVATE_KEY}${data}${env.LIQPAY_PRIVATE_KEY}`)
    .digest("base64")
  const nonce = Buffer.from(randomUUID()).toString("base64")
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Redirecting to LiqPay</title></head><body><form id="liqpay" method="post" action="https://www.liqpay.ua/api/3/checkout"><input type="hidden" name="data" value="${escapeAttribute(data)}"><input type="hidden" name="signature" value="${escapeAttribute(signature)}"><button type="submit">Continue to LiqPay</button></form><script nonce="${escapeAttribute(nonce)}">document.getElementById("liqpay").submit()</script></body></html>`
  return new Response(html, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": `default-src 'none'; form-action https://www.liqpay.ua; script-src 'nonce-${nonce}'; style-src 'none'; base-uri 'none'; frame-ancestors 'none'`,
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
