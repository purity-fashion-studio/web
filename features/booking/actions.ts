"use server"

import { createHmac, randomUUID } from "node:crypto"
import { headers } from "next/headers"
import { after } from "next/server"
import {
  commitTransaction,
  createLocalReq,
  getPayload,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from "payload"

import config from "@payload-config"
import { defaultLocale, hasLocale, type Locale } from "@/i18n/routing"
import { env } from "@/lib/env"
import { isPaymentAmountAllowed } from "@/lib/payment-limits"
import { getSiteURL } from "@/lib/site-url"
import type {
  BookingRequest as StoredBookingRequest,
  Lead as StoredLead,
  PaymentOrder as StoredPaymentOrder,
} from "@/payload-types"

import { AdvisoryLockTimeoutError, withAdvisoryLock } from "./advisory-lock"
import { requestReceivedEmail } from "./email-copy"
import { ensureCheckout } from "./checkout-persistence"
import { internalNotificationMessages } from "./notification-recipients"
import { readSubmissionSnapshot } from "./submission-snapshot"
import {
  deliverNotificationBatch,
  enqueueNotifications,
} from "./notification-outbox"

import {
  bookingSchema,
  createLeadId,
  routePaymentProvider,
  type BookingFieldErrors,
  type BookingResult,
  type BookingValues,
  type PaymentCurrency,
} from "./schema"
import {
  isOfferCheckoutEligible,
  isOfferFormatCompatible,
} from "./offer-eligibility"

const consentVersion = "privacy-booking-v1"

async function withBookingLock<T>(
  payload: Payload,
  idempotencyKey: string,
  operation: () => Promise<T>
): Promise<T | BookingResult> {
  try {
    return await withAdvisoryLock(payload, "booking", idempotencyKey, operation)
  } catch (error) {
    if (error instanceof AdvisoryLockTimeoutError) {
      return { status: "error", message: "serviceUnavailable" }
    }
    throw error
  }
}

async function ensureBookingNotifications({
  payload,
  bookingRequestID,
  email,
  locale,
  origin,
  req,
  serviceSlug,
}: {
  payload: Payload
  bookingRequestID: string
  email: string
  locale: Locale
  origin: string
  req?: PayloadRequest
  serviceSlug: string
}) {
  const clientEmail = requestReceivedEmail(locale, bookingRequestID)
  await enqueueNotifications({
    payload,
    req,
    messages: [
      {
        bookingRequest: bookingRequestID,
        deduplicationKey: `booking:${bookingRequestID}:received:client`,
        recipient: email,
        recipientType: "client",
        ...clientEmail,
      },
      ...(await internalNotificationMessages(
        payload,
        {
          bookingRequest: bookingRequestID,
          deduplicationKey: `booking:${bookingRequestID}:received:internal`,
          subject: "PURITY — new booking request",
          text: `Booking request ${bookingRequestID} for ${serviceSlug} requires review: ${origin}/admin/collections/booking-requests/${bookingRequestID}`,
        },
        req
      )),
    ],
  })
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : undefined
}

function limited(value: string | undefined, maxLength: number) {
  return value?.trim().slice(0, maxLength) || undefined
}

function relationshipID(value: unknown) {
  return typeof value === "string"
    ? value
    : value && typeof value === "object" && "id" in value
      ? String(value.id)
      : undefined
}

function normalizedPhone(value: string | undefined) {
  const digits = value?.replace(/\D/g, "")
  return digits
    ? `${value?.trim().startsWith("+") ? "+" : ""}${digits}`
    : undefined
}

async function matchesBookingReplay(
  payload: Payload,
  existing: StoredBookingRequest,
  booking: BookingValues,
  offerID?: string
) {
  const serviceResult = await payload.find({
    collection: "services",
    depth: 0,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: { slug: { equals: booking.serviceSlug } },
  })
  if (relationshipID(existing.service) !== serviceResult.docs[0]?.id) {
    return false
  }
  if (offerID && relationshipID(existing.offer) !== offerID) return false
  if (
    existing.inquiryType !== booking.inquiryType ||
    existing.format !== requestFormat(booking.format) ||
    existing.currency !== booking.budgetCurrency ||
    (existing.message ?? "") !== booking.message.trim()
  ) {
    return false
  }

  const requestedDate = booking.preferredAt
    ? new Date(booking.preferredAt)
    : undefined
  const requestedDateValue =
    requestedDate && !Number.isNaN(requestedDate.valueOf())
      ? requestedDate.valueOf()
      : undefined
  const storedDateValue = existing.preferredDates?.[0]?.preferredAt
    ? new Date(existing.preferredDates[0].preferredAt).valueOf()
    : undefined
  if (requestedDateValue !== storedDateValue) return false

  const snapshot = readSubmissionSnapshot(existing.submissionSnapshot)
  if (snapshot) {
    return (
      snapshot.offerId === offerID &&
      snapshot.intent ===
        (booking.intent ?? (offerID ? "checkout" : "request")) &&
      (snapshot.courseSlug || undefined) ===
        (booking.courseSlug || undefined) &&
      (snapshot.collectionSlug || undefined) ===
        (booking.collectionSlug || undefined) &&
      snapshot.name.trim() === booking.name.trim() &&
      snapshot.email.toLowerCase() === booking.email.toLowerCase() &&
      normalizedPhone(snapshot.phone) === normalizedPhone(booking.phone) &&
      (snapshot.company ?? "").trim() === (booking.company ?? "").trim() &&
      snapshot.contactMethod === booking.contactMethod
    )
  }
  const leadID = relationshipID(existing.lead)
  if (!leadID) return false
  const lead = await payload.findByID({
    collection: "leads",
    id: leadID,
    depth: 0,
    overrideAccess: true,
  })
  return (
    lead.name.trim() === booking.name.trim() &&
    lead.email?.trim().toLowerCase() === booking.email.trim().toLowerCase() &&
    normalizedPhone(lead.phone ?? undefined) ===
      normalizedPhone(booking.phone) &&
    (lead.company ?? "").trim() === (booking.company ?? "").trim() &&
    lead.preferredContactMethod === booking.contactMethod
  )
}

function attribution(formData: FormData) {
  return {
    utmSource: limited(formValue(formData, "utm_source"), 200),
    utmMedium: limited(formValue(formData, "utm_medium"), 200),
    utmCampaign: limited(formValue(formData, "utm_campaign"), 200),
    utmContent: limited(formValue(formData, "utm_content"), 200),
    utmTerm: limited(formValue(formData, "utm_term"), 200),
  }
}

function requestFormat(format: BookingValues["format"]) {
  return format === "atelier" ? "remote-atelier" : format
}

function selectedAmount(
  offer: {
    pricingMode: "fixed" | "from" | "range" | "custom"
    checkoutMode:
      "instant-payment" | "deposit" | "booking-request" | "inquiry" | "waitlist"
    prices?: Array<{
      currency: "EUR" | "UAH"
      amount?: number | null
      minAmount?: number | null
    }> | null
    deposit?: { amount?: number | null; percentage?: number | null }
  },
  currency: PaymentCurrency
) {
  const price = offer.prices?.find((item) => item.currency === currency)
  if (!price) return null

  if (offer.checkoutMode === "instant-payment") {
    return offer.pricingMode === "fixed" ? (price.amount ?? null) : null
  }
  if (offer.checkoutMode !== "deposit") return null
  if (offer.deposit?.amount != null) return offer.deposit.amount
  if (
    offer.deposit?.percentage != null &&
    offer.pricingMode === "fixed" &&
    price.amount != null
  ) {
    return Math.round((price.amount * offer.deposit.percentage) / 100)
  }
  return null
}

export async function submitBooking(
  _previousState: BookingResult,
  formData: FormData
): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse({
    inquiryType: formValue(formData, "inquiryType"),
    serviceSlug: formValue(formData, "serviceSlug"),
    courseSlug: formValue(formData, "courseSlug"),
    collectionSlug: formValue(formData, "collectionSlug"),
    intent: formValue(formData, "intent"),
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    company: formValue(formData, "company"),
    format: formValue(formData, "format"),
    contactMethod: formValue(formData, "contactMethod"),
    budgetCurrency: formValue(formData, "budgetCurrency"),
    preferredAt: formValue(formData, "preferredAt"),
    message: formValue(formData, "message"),
    consent: formData.get("consent") === "on",
  })

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    return {
      status: "error",
      message: "validation",
      fieldErrors: Object.fromEntries(
        Object.entries(errors).map(([key, messages]) => [key, messages?.[0]])
      ) as BookingFieldErrors,
    }
  }

  const booking = parsed.data
  if (
    booking.preferredAt &&
    !/(?:Z|[+-]\d{2}:\d{2})$/.test(booking.preferredAt)
  ) {
    return {
      status: "error",
      message: "validation",
      fieldErrors: { preferredAt: "required" },
    }
  }
  const rawLocale = formValue(formData, "locale")
  const locale = rawLocale && hasLocale(rawLocale) ? rawLocale : defaultLocale
  const requestHeaders = await headers()
  const origin = getSiteURL()

  if (env.PAYLOAD_ENABLED !== "true") {
    return { status: "error", message: "serviceUnavailable" }
  }

  if (formValue(formData, "website")) {
    return { status: "success", leadId: createLeadId() }
  }
  const startedAt = Number(formValue(formData, "submissionStartedAt"))
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1200) {
    return { status: "success", leadId: createLeadId() }
  }

  const payload = await getPayload({ config })
  const sourcePage =
    limited(formValue(formData, "sourcePage"), 1000) ?? "/booking"
  const referrer = limited(formValue(formData, "referrer"), 1000)
  const touch = { landingPage: sourcePage, referrer, ...attribution(formData) }
  const idempotencyKey = limited(formValue(formData, "idempotencyKey"), 160)
  const requestedOfferID = limited(formValue(formData, "offerId"), 160)
  const checkoutIntent =
    booking.intent ?? (requestedOfferID ? "checkout" : "request")
  if (booking.courseSlug && booking.collectionSlug)
    return { status: "error", message: "validation" }
  if (!idempotencyKey) {
    return { status: "error", message: "validation" }
  }

  const result = await withBookingLock<BookingResult>(
    payload,
    idempotencyKey,
    async () => {
      const bookingSettings = await payload.findGlobal({
        slug: "booking-settings",
        depth: 0,
        overrideAccess: true,
      })
      const existingRequest = await payload.find({
        collection: "booking-requests",
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { idempotencyKey: { equals: idempotencyKey } },
      })
      if (existingRequest.docs[0]) {
        const existing = existingRequest.docs[0]
        if (
          !(await matchesBookingReplay(
            payload,
            existing,
            booking,
            requestedOfferID
          ))
        ) {
          return { status: "error", message: "validation" }
        }
        await ensureBookingNotifications({
          payload,
          bookingRequestID: existing.id,
          email: booking.email.toLowerCase(),
          locale,
          origin,
          serviceSlug: booking.serviceSlug,
        })
        const paymentOrderID =
          typeof existing.paymentOrder === "string"
            ? existing.paymentOrder
            : existing.paymentOrder?.id
        let paymentOrder = paymentOrderID
          ? await payload.findByID({
              collection: "payment-orders",
              id: paymentOrderID,
              depth: 0,
              overrideAccess: true,
            })
          : undefined
        if (
          paymentOrder &&
          (["created", "pending", "requires-action"].includes(
            paymentOrder.status
          ) ||
            (paymentOrder.status === "failed" &&
              paymentOrder.safeFailureCode === "checkout-creation-failed")) &&
          (!bookingSettings.enabledModes.includes(existing.requestMode) ||
            !bookingSettings.providerRouting?.some(
              (route) =>
                route.enabled &&
                route.currency === paymentOrder!.currency &&
                route.provider === paymentOrder!.provider
            ))
        ) {
          return { status: "error", message: "serviceUnavailable" }
        }
        if (
          paymentOrder &&
          !paymentOrder.checkoutURL &&
          (paymentOrder.status === "created" ||
            (paymentOrder.status === "failed" &&
              paymentOrder.safeFailureCode === "checkout-creation-failed")) &&
          (paymentOrder.provider === "stripe" ||
            paymentOrder.provider === "liqpay")
        ) {
          paymentOrder = await ensureCheckout({
            payload,
            order: paymentOrder,
            booking,
            origin,
            locale,
          })
        }
        const checkoutOrder =
          paymentOrder &&
          ["created", "pending", "requires-action"].includes(
            paymentOrder.status
          )
            ? paymentOrder
            : undefined
        return {
          status: "success",
          leadId:
            typeof existing.lead === "string"
              ? existing.lead
              : existing.lead.id,
          bookingRequestId: existing.id,
          checkoutUrl: checkoutOrder?.checkoutURL ?? undefined,
          checkoutUnavailable: Boolean(
            paymentOrder &&
            !paymentOrder.checkoutURL &&
            (["created", "pending", "requires-action"].includes(
              paymentOrder.status
            ) ||
              paymentOrder.safeFailureCode === "checkout-creation-failed")
          ),
          provider:
            checkoutOrder &&
            (checkoutOrder.provider === "stripe" ||
              checkoutOrder.provider === "liqpay")
              ? checkoutOrder.provider
              : undefined,
          currency: checkoutOrder?.currency,
        }
      }

      // Vercel's x-real-ip is set at the trusted ingress boundary. Do not use
      // the left-most X-Forwarded-For value: callers can supply that header.
      const clientIP = requestHeaders.get("x-real-ip")?.trim() || "unknown"
      const fingerprint = createHmac("sha256", env.PAYLOAD_SECRET ?? "disabled")
        .update(clientIP)
        .digest("hex")
      return withAdvisoryLock(payload, "rate-limit", fingerprint, async () => {
        const recent = await payload.count({
          collection: "booking-requests",
          overrideAccess: true,
          where: {
            and: [
              { requestFingerprint: { equals: fingerprint } },
              {
                createdAt: {
                  greater_than: new Date(
                    Date.now() - 15 * 60 * 1000
                  ).toISOString(),
                },
              },
            ],
          },
        })
        if (recent.totalDocs >= 5) {
          return { status: "error", message: "rateLimit" }
        }

        const serviceResult = await payload.find({
          collection: "services",
          depth: 0,
          fallbackLocale: false,
          limit: 1,
          locale,
          overrideAccess: false,
          select: { id: true, slug: true, title: true },
          where: { slug: { equals: booking.serviceSlug } },
        })
        const service = serviceResult.docs[0]
        if (!service) {
          return {
            status: "error",
            message: "validation",
            fieldErrors: { serviceSlug: "required" },
          }
        }

        const offerResult = await payload.find({
          collection: "offers",
          depth: 0,
          fallbackLocale: false,
          limit: 10,
          locale,
          overrideAccess: false,
          sort: "sortOrder",
          where: requestedOfferID
            ? { id: { equals: requestedOfferID } }
            : { service: { equals: service.id } },
        })
        const offer = requestedOfferID
          ? offerResult.docs.find(
              (item) =>
                item.id === requestedOfferID &&
                (checkoutIntent === "request"
                  ? item.enabled && item._status === "published"
                  : isOfferCheckoutEligible(item)) &&
                isOfferFormatCompatible(item, booking.format)
            )
          : undefined
        if (requestedOfferID && !offer) {
          return { status: "error", message: "validation" }
        }
        const offerServiceID = relationshipID(offer?.service)
        let offerCourseID = relationshipID(offer?.course)
        let offerCollectionID = relationshipID(offer?.fashionCollection)
        if (
          offer &&
          ((offerServiceID && offerServiceID !== service.id) ||
            (offerCourseID && service.slug !== "wardrobe-management") ||
            (offerCollectionID && service.slug !== "capsule-collection"))
        ) {
          return { status: "error", message: "validation" }
        }

        if (
          (booking.courseSlug && service.slug !== "wardrobe-management") ||
          (booking.collectionSlug && service.slug !== "capsule-collection")
        ) {
          return { status: "error", message: "validation" }
        }
        if (
          offerCourseID ||
          offerCollectionID ||
          booking.courseSlug ||
          booking.collectionSlug
        ) {
          const courseSelection = Boolean(offerCourseID || booking.courseSlug)
          const parentSlug = courseSelection
            ? booking.courseSlug
            : booking.collectionSlug
          const parentOfferID = courseSelection
            ? offerCourseID
            : offerCollectionID
          const parent = await payload.find({
            collection: courseSelection ? "courses" : "fashion-collections",
            depth: 0,
            limit: 1,
            locale,
            fallbackLocale: false,
            overrideAccess: false,
            where: parentSlug
              ? { slug: { equals: parentSlug } }
              : { id: { equals: parentOfferID } },
          })
          if (
            !parent.docs[0] ||
            !parent.docs[0].enabled ||
            parent.docs[0]._status !== "published" ||
            (offer && parentOfferID !== parent.docs[0].id) ||
            (checkoutIntent === "checkout" &&
              ["instant-payment", "deposit"].includes(
                offer?.checkoutMode ?? ""
              ) &&
              parent.docs[0].availability !== "available")
          ) {
            return { status: "error", message: "validation" }
          }
          if (courseSelection) offerCourseID = parent.docs[0].id
          else offerCollectionID = parent.docs[0].id
        }
        const normalizedEmail = booking.email.trim().toLowerCase()
        const identityKey = `email:${normalizedEmail}`
        const normalizedPhoneValue = normalizedPhone(booking.phone)
        const phoneIdentityKey = normalizedPhoneValue
          ? `phone:${normalizedPhoneValue}`
          : undefined
        const now = new Date().toISOString()
        const sourceType =
          booking.inquiryType === "corporate"
            ? "corporate"
            : offerCourseID
              ? "course"
              : offerCollectionID
                ? "collection"
                : service.slug.includes("atelier")
                  ? "atelier"
                  : "booking"
        const preferredDate = booking.preferredAt
          ? new Date(booking.preferredAt)
          : undefined
        const paymentAmount = offer
          ? selectedAmount(offer, booking.budgetCurrency)
          : null
        if (
          checkoutIntent === "checkout" &&
          offer &&
          ["instant-payment", "deposit"].includes(offer.checkoutMode) &&
          !isPaymentAmountAllowed(paymentAmount)
        ) {
          return { status: "error", message: "validation" }
        }
        const requiresPayment = Boolean(
          checkoutIntent === "checkout" &&
          offer &&
          ["instant-payment", "deposit"].includes(offer.checkoutMode) &&
          paymentAmount != null
        )
        const requestMode =
          checkoutIntent === "request"
            ? bookingSettings.enabledModes.includes("booking-request")
              ? "booking-request"
              : "inquiry"
            : (offer?.checkoutMode ?? "booking-request")
        const paymentProvider = routePaymentProvider(booking.budgetCurrency)
        if (
          !bookingSettings.enabledModes.includes(requestMode) ||
          (requiresPayment &&
            !bookingSettings.providerRouting?.some(
              (route) =>
                route.currency === booking.budgetCurrency &&
                route.provider === paymentProvider &&
                route.enabled
            ))
        ) {
          return { status: "error", message: "serviceUnavailable" }
        }
        const transactionReq = await createLocalReq(
          { context: { service: "public-booking" } },
          payload
        )
        let lead!: StoredLead
        const resolveLead = async () => {
          const existingLead = await payload.find({
            collection: "leads",
            depth: 0,
            limit: 2,
            overrideAccess: true,
            req: transactionReq,
            where: {
              or: [
                { identityKey: { equals: identityKey } },
                { email: { equals: normalizedEmail } },
                ...(phoneIdentityKey
                  ? [
                      { phoneIdentityKey: { equals: phoneIdentityKey } },
                      { phone: { equals: normalizedPhoneValue } },
                    ]
                  : []),
              ],
            },
          })
          if (existingLead.docs.length > 1) {
            throw new Error("Conflicting lead identities require manual review")
          }
          if (
            existingLead.docs[0] &&
            existingLead.docs[0].email?.trim().toLowerCase() !== normalizedEmail
          ) {
            throw new Error("Conflicting lead identities require manual review")
          }
          return existingLead.docs[0]
            ? payload.update({
                collection: "leads",
                id: existingLead.docs[0].id,
                context: { service: "public-booking" },
                data: {
                  preferredContactMethod: booking.contactMethod,
                  locale,
                  sourceType,
                  lastTouch: touch,
                },
                overrideAccess: true,
                req: transactionReq,
              })
            : payload.create({
                collection: "leads",
                context: { service: "public-booking" },
                data: {
                  identityKey,
                  phoneIdentityKey,
                  name: booking.name,
                  email: normalizedEmail,
                  phone: normalizedPhoneValue,
                  company: booking.company,
                  preferredContactMethod: booking.contactMethod,
                  locale,
                  sourceType,
                  consent: { version: consentVersion, acceptedAt: now },
                  firstTouch: touch,
                  lastTouch: touch,
                  duplicateState: "unique",
                },
                overrideAccess: true,
                req: transactionReq,
              })
        }
        let bookingRequest!: StoredBookingRequest
        let paymentOrder: StoredPaymentOrder | undefined
        const provider = requiresPayment
          ? routePaymentProvider(booking.budgetCurrency)
          : undefined
        const orderUUID = requiresPayment ? randomUUID() : undefined
        const persistBooking = async (): Promise<BookingResult | undefined> => {
          await initTransaction(transactionReq)
          try {
            lead = await resolveLead()
            bookingRequest = await payload.create({
              collection: "booking-requests",
              context: { service: "public-booking" },
              data: {
                idempotencyKey,
                requestFingerprint: fingerprint,
                lead: lead.id,
                service: service.id,
                offer: offer?.id,
                course: offerCourseID,
                fashionCollection: offerCollectionID,
                inquiryType: booking.inquiryType,
                requestMode,
                format: requestFormat(booking.format),
                preferredDates:
                  preferredDate && !Number.isNaN(preferredDate.valueOf())
                    ? [{ preferredAt: preferredDate.toISOString() }]
                    : [],
                message: booking.message,
                currency: booking.budgetCurrency,
                sourcePage,
                referrer,
                attribution: attribution(formData),
                status: requiresPayment ? "awaiting-payment" : "new",
                consentVersion,
                consentAcceptedAt: now,
                submissionSnapshot: {
                  ...booking,
                  intent: checkoutIntent,
                  email: normalizedEmail,
                  locale,
                  offerId: requestedOfferID,
                },
                notificationStatus: "pending",
              },
              overrideAccess: true,
              req: transactionReq,
            })

            if (
              requiresPayment &&
              offer &&
              paymentAmount != null &&
              provider &&
              orderUUID
            ) {
              paymentOrder = await payload.create({
                collection: "payment-orders",
                context: { service: "public-booking" },
                data: {
                  orderUUID,
                  bookingRequest: bookingRequest.id,
                  commercialSnapshot: {
                    offerID: offer.id,
                    title: offer.title,
                    sku: offer.sku,
                    termsVersion: offer.termsVersion,
                  },
                  provider,
                  amount: paymentAmount,
                  currency: booking.budgetCurrency,
                  mode: env.PAYMENT_MODE,
                  status: "created",
                  notificationStatus: "pending",
                  nextReconcileAt: new Date().toISOString(),
                  reconciliationAttempts: 0,
                  idempotencyKey: `payment:${idempotencyKey}`,
                  auditNote: "Created from verified public booking request.",
                },
                overrideAccess: true,
                req: transactionReq,
              })
              await payload.update({
                collection: "booking-requests",
                id: bookingRequest.id,
                context: { service: "public-booking" },
                data: { paymentOrder: paymentOrder.id },
                overrideAccess: true,
                req: transactionReq,
              })
            }

            await ensureBookingNotifications({
              payload,
              bookingRequestID: bookingRequest.id,
              email: normalizedEmail,
              locale,
              origin,
              req: transactionReq,
              serviceSlug: service.slug,
            })
            await commitTransaction(transactionReq)
          } catch (error) {
            await killTransaction(transactionReq)
            payload.logger.error({
              correlationID: idempotencyKey,
              operation: "public-booking",
              code: "booking-persistence-failed",
              err: {
                name: error instanceof Error ? error.name : "UnknownError",
                message: "booking-persistence-failed",
              },
            })
            return { status: "error", message: "serviceUnavailable" }
          }
        }
        // Identity serialization must cover commit, not just the initial lookup:
        // another transaction cannot reuse a lead that is still uncommitted.
        const persistenceFailure = await withAdvisoryLock(
          payload,
          "lead-identity",
          identityKey,
          () =>
            phoneIdentityKey
              ? withAdvisoryLock(
                  payload,
                  "lead-identity",
                  phoneIdentityKey,
                  persistBooking
                )
              : persistBooking()
        )
        if (persistenceFailure) return persistenceFailure

        let checkout: StoredPaymentOrder | undefined
        let checkoutUnavailable = requiresPayment
        if (paymentOrder) {
          try {
            const saved = await ensureCheckout({
              payload,
              order: paymentOrder,
              booking,
              origin,
              locale,
            })
            checkoutUnavailable = [
              "created",
              "pending",
              "requires-action",
            ].includes(saved.status)
              ? !saved.checkoutURL
              : saved.status === "failed" &&
                saved.safeFailureCode === "checkout-creation-failed"
            if (
              ["created", "pending", "requires-action"].includes(saved.status)
            )
              checkout = saved
          } catch {
            // The request is committed. Provider idempotency permits a later
            // retry if checkout metadata could not be persisted.
          }
        }
        return {
          status: "success",
          leadId: lead.id,
          bookingRequestId: bookingRequest.id,
          checkoutUrl: checkout?.checkoutURL ?? undefined,
          checkoutUnavailable,
          provider:
            checkout?.provider === "stripe" || checkout?.provider === "liqpay"
              ? checkout.provider
              : undefined,
          currency: checkout?.currency,
        }
      })
    }
  )

  // Register the deferred drain after the advisory-lock context has been
  // released. Next.js snapshots the callback context; registering inside the
  // lock would leave it holding a released pool client.
  if (result.status === "success") {
    after(() => deliverNotificationBatch(payload, 10))
  }
  return result
}
