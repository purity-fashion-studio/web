import assert from "node:assert/strict"

import { canTransitionPaymentStatus } from "../features/booking/payment-transitions"
import { routePaymentProvider } from "../features/booking/schema"

assert.equal(routePaymentProvider("EUR"), "stripe")
assert.equal(routePaymentProvider("UAH"), "liqpay")
assert.equal(canTransitionPaymentStatus("created", "pending"), true)
assert.equal(canTransitionPaymentStatus("pending", "paid"), true)
assert.equal(canTransitionPaymentStatus("paid", "expired"), false)
assert.equal(canTransitionPaymentStatus("paid", "failed"), false)
assert.equal(canTransitionPaymentStatus("paid", "partially-refunded"), true)
assert.equal(canTransitionPaymentStatus("partially-refunded", "refunded"), true)
assert.equal(canTransitionPaymentStatus("refunded", "paid"), false)
assert.equal(canTransitionPaymentStatus("expired", "paid"), true)
assert.equal(canTransitionPaymentStatus("disputed", "refunded"), true)

console.log("Payment contract ok: routing and monotonic status transitions")
