"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import {
  Controller,
  useForm,
  useWatch,
  type FieldPath,
  type Resolver,
} from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { submitBooking } from "@/features/booking/actions"
import { trackBookingEvent } from "@/features/booking/analytics"
import {
  localizeBookingError,
  type BookingPublicCopy,
} from "@/features/booking/public-copy"
import {
  bookingSchema,
  contactMethods,
  formats,
  inquiryTypes,
  paymentCurrencies,
  routePaymentProvider,
  type BookingInput,
  type BookingFormat,
  type PaymentCurrency,
  type BookingResult,
} from "@/features/booking/schema"
import type { Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { getInterfaceCopy } from "@/i18n/messages"
import type { ResolvedCartItem } from "@/features/cart/actions"

type ServiceOption = {
  slug: string
  title: string
}

type BookingFormProps = {
  locale: Locale
  services: ServiceOption[]
  initialServiceSlug: string
  initialOfferId?: string
  initialCourseSlug?: string
  initialCollectionSlug?: string
  initialFormat?: BookingFormat
  initialCurrency?: PaymentCurrency
  initialIntent?: "request" | "checkout"
  selection?: ResolvedCartItem
  copy: BookingPublicCopy
}

const bookingResolver: Resolver<BookingInput> = async (values) => {
  const parsed = bookingSchema.safeParse(values)

  if (parsed.success) {
    return {
      values: parsed.data,
      errors: {},
    }
  }

  return {
    values: {},
    errors: Object.fromEntries(
      parsed.error.issues.flatMap((issue) => {
        const path = issue.path[0]

        if (typeof path !== "string") {
          return []
        }

        return [
          [
            path,
            {
              type: issue.code,
              message: issue.message,
            },
          ],
        ]
      })
    ),
  }
}

function fieldErrorId(name: string) {
  return `${fieldId(name)}-error`
}

function BookingFieldError({
  name,
  message,
}: {
  name: string
  message?: string
}) {
  if (!message) {
    return null
  }

  return <FieldError id={fieldErrorId(name)}>{message}</FieldError>
}

function fieldId(name: string) {
  return `booking-${name}`
}

function BookingForm({
  locale,
  services,
  initialServiceSlug,
  initialOfferId,
  initialCourseSlug,
  initialCollectionSlug,
  initialFormat,
  initialCurrency,
  initialIntent,
  selection,
  copy,
}: BookingFormProps) {
  const [submissionStartedAt, setSubmissionStartedAt] = useState(() =>
    Date.now()
  )
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID()
  )
  const [result, setResult] = useState<BookingResult>({ status: "idle" })
  const [isPending, startTransition] = useTransition()
  const statusAlertRef = useRef<HTMLDivElement>(null)
  const defaultService = services.some(
    (service) => service.slug === initialServiceSlug
  )
    ? initialServiceSlug
    : services[0]?.slug
  const form = useForm<BookingInput>({
    resolver: bookingResolver,
    defaultValues: {
      inquiryType: "private",
      serviceSlug: defaultService,
      courseSlug: initialCourseSlug,
      collectionSlug: initialCollectionSlug,
      intent: initialIntent ?? (initialOfferId ? "checkout" : "request"),
      name: "",
      email: "",
      phone: "",
      company: "",
      format: initialFormat ?? "studio",
      contactMethod: "email",
      budgetCurrency: initialCurrency ?? "EUR",
      preferredAt: "",
      message: "",
      consent: false,
    },
    mode: "onSubmit",
  })
  const currency = useWatch({
    control: form.control,
    name: "budgetCurrency",
  })
  const selectedServiceSlug = useWatch({
    control: form.control,
    name: "serviceSlug",
  })
  const selectedFormat = useWatch({ control: form.control, name: "format" })
  const selectedContactMethod = useWatch({
    control: form.control,
    name: "contactMethod",
  })
  const preferredAt = useWatch({ control: form.control, name: "preferredAt" })
  const provider = routePaymentProvider(currency)
  const serverErrors =
    result.status === "error" ? result.fieldErrors : undefined
  const hasClientErrors =
    form.formState.isSubmitted && Object.keys(form.formState.errors).length > 0
  const serviceOptions = services
  const serviceSelectItems = serviceOptions.map((service) => ({
    value: service.slug,
    label: service.title,
  }))
  const currencySelectItems = paymentCurrencies.map((currency) => ({
    value: currency,
    label: copy.currencies[currency],
  }))
  const selectedServiceTitle =
    serviceOptions.find((service) => service.slug === selectedServiceSlug)
      ?.title ?? copy.emptyService

  useEffect(() => {
    if (
      hasClientErrors ||
      result.status === "error" ||
      result.status === "success"
    ) {
      statusAlertRef.current?.focus()
    }
  }, [hasClientErrors, result.status])

  function errorFor(name: FieldPath<BookingInput>) {
    const message = form.formState.errors[name]?.message ?? serverErrors?.[name]

    if (typeof message !== "string") {
      return undefined
    }

    return localizeBookingError(copy.errors, message)
  }

  async function onSubmit(values: BookingInput) {
    if (result.status === "success" && !result.checkoutUnavailable) return
    const formData = new FormData()

    formData.set("locale", locale)
    formData.set("offerId", initialOfferId ?? "")
    formData.set("website", "")
    formData.set("submissionStartedAt", String(submissionStartedAt))
    formData.set("idempotencyKey", idempotencyKey)
    formData.set(
      "sourcePage",
      `${window.location.pathname}${window.location.search}`
    )
    formData.set("referrer", document.referrer)
    const search = new URLSearchParams(window.location.search)
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ]) {
      formData.set(key, search.get(key) ?? "")
    }

    for (const [key, value] of Object.entries(values)) {
      if (key === "consent") {
        if (value) {
          formData.set(key, "on")
        }

        continue
      }

      formData.set(
        key,
        key === "preferredAt" && value
          ? new Date(String(value)).toISOString()
          : String(value ?? "")
      )
    }

    startTransition(async () => {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          Math.max(0, 1250 - (Date.now() - submissionStartedAt))
        )
      )
      const nextResult = await submitBooking(result, formData).catch(
        () => ({ status: "error", message: "serviceUnavailable" }) as const
      )
      if (nextResult.status === "success") {
        trackBookingEvent({
          event: "booking_submit",
          serviceSlug: values.serviceSlug,
          provider: nextResult.provider,
          currency: nextResult.currency,
        })
        if (nextResult.provider && nextResult.currency) {
          trackBookingEvent({
            event: "checkout_start",
            serviceSlug: values.serviceSlug,
            provider: nextResult.provider,
            currency: nextResult.currency,
          })
        }
      }
      setResult(nextResult)
    })
  }

  if (!serviceOptions.length) {
    return (
      <Alert>
        <AlertTitle>{copy.errorTitle}</AlertTitle>
        <AlertDescription>{copy.emptyService}</AlertDescription>
      </Alert>
    )
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      aria-busy={isPending}
      className="grid min-w-0 gap-10"
      data-state={isPending ? "submitting" : result.status}
      data-testid="booking-form"
    >
      {(result.status === "error" || hasClientErrors) && (
        <Alert
          ref={statusAlertRef}
          tabIndex={-1}
          aria-live="assertive"
          className="focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AlertTitle>{copy.errorTitle}</AlertTitle>
          <AlertDescription>
            {result.status === "error" &&
            result.message in getInterfaceCopy(locale).BookingMessages
              ? getInterfaceCopy(locale).BookingMessages[
                  result.message as keyof ReturnType<
                    typeof getInterfaceCopy
                  >["BookingMessages"]
                ]
              : copy.validationError}
          </AlertDescription>
        </Alert>
      )}

      {result.status === "success" && (
        <Alert
          ref={statusAlertRef}
          tabIndex={-1}
          aria-live="polite"
          className="focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AlertTitle>{copy.successTitle}</AlertTitle>
          <AlertDescription>
            {result.checkoutUnavailable
              ? getInterfaceCopy(locale).BookingMessages.checkoutUnavailable
              : copy.successSummary}{" "}
            {result.provider && result.currency
              ? `${copy.providers[result.provider]} / ${result.currency}`
              : ""}
          </AlertDescription>
          {result.checkoutUrl && (
            <Link
              href={result.checkoutUrl}
              className={cn(
                buttonVariants({
                  variant: "default",
                  size: "lg",
                  className: "mt-4 w-fit",
                })
              )}
            >
              {copy.checkout}
            </Link>
          )}
        </Alert>
      )}

      <FieldSet data-testid="booking-contact-fields">
        <FieldLegend className="w-full text-center tracking-[0.16em]">
          {copy.contactTitle}
        </FieldLegend>

        <FieldGroup className="grid gap-8 lg:grid-cols-2">
          <Controller
            control={form.control}
            name="inquiryType"
            render={({ field }) => (
              <FieldSet>
                <FieldLegend id={fieldId("inquiry-type")} variant="label">
                  {copy.labels.inquiryType}
                </FieldLegend>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-labelledby={fieldId("inquiry-type")}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {inquiryTypes.map((type) => (
                    <Field key={type} orientation="horizontal">
                      <FieldLabel>
                        <RadioGroupItem value={type} />
                        {copy.inquiryTypes[type]}
                      </FieldLabel>
                    </Field>
                  ))}
                </RadioGroup>
              </FieldSet>
            )}
          />

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field data-invalid={Boolean(errorFor("name"))}>
              <FieldLabel htmlFor={fieldId("name")}>
                {copy.labels.name}
              </FieldLabel>
              <Input
                id={fieldId("name")}
                aria-invalid={Boolean(errorFor("name"))}
                aria-describedby={
                  errorFor("name") ? fieldErrorId("name") : undefined
                }
                {...form.register("name")}
              />
              <BookingFieldError name="name" message={errorFor("name")} />
            </Field>

            <Field data-invalid={Boolean(errorFor("email"))}>
              <FieldLabel htmlFor={fieldId("email")}>
                {copy.labels.email}
              </FieldLabel>
              <Input
                id={fieldId("email")}
                type="email"
                aria-invalid={Boolean(errorFor("email"))}
                aria-describedby={
                  errorFor("email") ? fieldErrorId("email") : undefined
                }
                {...form.register("email")}
              />
              <BookingFieldError name="email" message={errorFor("email")} />
            </Field>

            <Field data-invalid={Boolean(errorFor("phone"))}>
              <FieldLabel htmlFor={fieldId("phone")}>
                {copy.labels.phone}
              </FieldLabel>
              <Input
                id={fieldId("phone")}
                aria-invalid={Boolean(errorFor("phone"))}
                aria-describedby={
                  errorFor("phone") ? fieldErrorId("phone") : undefined
                }
                {...form.register("phone")}
              />
              <BookingFieldError name="phone" message={errorFor("phone")} />
            </Field>

            <Field data-invalid={Boolean(errorFor("company"))}>
              <FieldLabel htmlFor={fieldId("company")}>
                {copy.labels.company}
              </FieldLabel>
              <Input
                id={fieldId("company")}
                aria-invalid={Boolean(errorFor("company"))}
                aria-describedby={
                  errorFor("company") ? fieldErrorId("company") : undefined
                }
                {...form.register("company")}
              />
              <BookingFieldError name="company" message={errorFor("company")} />
            </Field>
          </FieldGroup>
        </FieldGroup>
      </FieldSet>

      <FieldSet
        data-testid="booking-payment-fields"
        className="border-t border-border pt-10"
      >
        <FieldLegend className="w-full text-center tracking-[0.16em]">
          {copy.paymentTitle}
        </FieldLegend>

        <FieldGroup className="grid gap-8 lg:grid-cols-2">
          <Controller
            control={form.control}
            name="serviceSlug"
            render={({ field }) => (
              <Field data-invalid={Boolean(errorFor("serviceSlug"))}>
                <FieldLabel>{copy.labels.serviceSlug}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  items={serviceSelectItems}
                  disabled={Boolean(selection)}
                >
                  <SelectTrigger
                    aria-label={copy.labels.serviceSlug}
                    aria-invalid={Boolean(errorFor("serviceSlug"))}
                    aria-describedby={
                      errorFor("serviceSlug")
                        ? fieldErrorId("serviceSlug")
                        : undefined
                    }
                    className="w-full"
                    data-testid="booking-service-trigger"
                  >
                    <SelectValue placeholder={copy.emptyService} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {serviceOptions.map((service) => (
                        <SelectItem key={service.slug} value={service.slug}>
                          {service.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <BookingFieldError
                  name="serviceSlug"
                  message={errorFor("serviceSlug")}
                />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="format"
            render={({ field }) => (
              <FieldSet>
                <FieldLegend id={fieldId("format")} variant="label">
                  {copy.labels.format}
                </FieldLegend>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-labelledby={fieldId("format")}
                  disabled={Boolean(selection)}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {formats.map((format) => (
                    <Field key={format} orientation="horizontal">
                      <FieldLabel>
                        <RadioGroupItem value={format} />
                        {copy.formats[format]}
                      </FieldLabel>
                    </Field>
                  ))}
                </RadioGroup>
              </FieldSet>
            )}
          />

          <Controller
            control={form.control}
            name="contactMethod"
            render={({ field }) => (
              <FieldSet>
                <FieldLegend id={fieldId("contact-method")} variant="label">
                  {copy.labels.contactMethod}
                </FieldLegend>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-labelledby={fieldId("contact-method")}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  {contactMethods.map((method) => (
                    <Field key={method} orientation="horizontal">
                      <FieldLabel>
                        <RadioGroupItem value={method} />
                        {copy.contactMethods[method]}
                      </FieldLabel>
                    </Field>
                  ))}
                </RadioGroup>
              </FieldSet>
            )}
          />

          <div className="grid gap-4">
            <Controller
              control={form.control}
              name="budgetCurrency"
              render={({ field }) => (
                <Field>
                  <FieldLabel>{copy.labels.budgetCurrency}</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={currencySelectItems}
                    disabled={Boolean(selection)}
                  >
                    <SelectTrigger
                      aria-label={copy.labels.budgetCurrency}
                      className="w-full"
                      data-testid="booking-currency-trigger"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {paymentCurrencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {copy.currencies[currency]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Alert data-testid="booking-routing-note">
              <AlertTitle>{copy.routingTitle}</AlertTitle>
              <AlertDescription>
                {copy.routingSummary} {copy.providers[provider]}
              </AlertDescription>
            </Alert>
          </div>

          <Field className="lg:col-span-2 lg:max-w-xl">
            <FieldLabel htmlFor={fieldId("preferredAt")}>
              {copy.labels.preferredAt}
            </FieldLabel>
            <Input
              id={fieldId("preferredAt")}
              type="datetime-local"
              aria-invalid={Boolean(errorFor("preferredAt"))}
              aria-describedby={
                errorFor("preferredAt")
                  ? fieldErrorId("preferredAt")
                  : undefined
              }
              {...form.register("preferredAt")}
            />
            <BookingFieldError
              name="preferredAt"
              message={errorFor("preferredAt")}
            />
          </Field>

          <Field
            className="lg:col-span-2"
            data-invalid={Boolean(errorFor("message"))}
          >
            <FieldLabel htmlFor={fieldId("message")}>
              {copy.labels.message}
            </FieldLabel>
            <Textarea
              id={fieldId("message")}
              rows={1}
              className="min-h-11"
              aria-invalid={Boolean(errorFor("message"))}
              aria-describedby={
                errorFor("message") ? fieldErrorId("message") : undefined
              }
              {...form.register("message")}
            />
            <BookingFieldError name="message" message={errorFor("message")} />
          </Field>

          <Controller
            control={form.control}
            name="consent"
            render={({ field }) => (
              <Field data-invalid={Boolean(errorFor("consent"))}>
                <FieldLabel className="flex items-start gap-3 text-sm leading-6">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={Boolean(errorFor("consent"))}
                    aria-describedby={
                      errorFor("consent") ? fieldErrorId("consent") : undefined
                    }
                  />
                  <span>{copy.labels.consent}</span>
                </FieldLabel>
                <BookingFieldError
                  name="consent"
                  message={errorFor("consent")}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <Card data-testid="booking-review">
        {selection && (
          <CardContent
            data-testid="booking-selection"
            className="grid gap-3 pt-6"
          >
            <p className="font-medium">{selection.title}</p>
            {selection.offerTitle && <p>{selection.offerTitle}</p>}
            {selection.price && (
              <p>
                {getInterfaceCopy(locale).Cart.price}: {selection.price}
              </p>
            )}
            {selection.requiresQuote && (
              <p>{getInterfaceCopy(locale).Cart.quote}</p>
            )}
          </CardContent>
        )}
        <CardHeader>
          <CardTitle>{copy.reviewTitle}</CardTitle>
          <CardDescription>{copy.reviewSummary}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">
                {copy.labels.serviceSlug}
              </dt>
              <dd className="font-medium">{selectedServiceTitle}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{copy.labels.format}</dt>
              <dd className="font-medium">{copy.formats[selectedFormat]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {copy.labels.contactMethod}
              </dt>
              <dd className="font-medium">
                {copy.contactMethods[selectedContactMethod]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {copy.labels.preferredAt}
              </dt>
              <dd className="font-medium">
                {preferredAt || copy.notSpecified}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Button
        type="submit"
        variant="default"
        size="lg"
        disabled={
          isPending ||
          (result.status === "success" && !result.checkoutUnavailable)
        }
        className="w-full md:w-fit"
        data-testid="booking-submit"
      >
        {isPending && (
          <Spinner aria-label={copy.submitting} data-icon="inline-start" />
        )}
        {isPending
          ? copy.submitting
          : result.status === "success" && result.checkoutUnavailable
            ? getInterfaceCopy(locale).BookingMessages.retryCheckout
            : copy.submit}
      </Button>
      {result.status === "success" && !result.checkoutUnavailable && (
        <Button
          type="button"
          variant="outline"
          className="w-full md:w-fit"
          data-testid="booking-new-request"
          onClick={() => {
            form.reset()
            setResult({ status: "idle" })
            setIdempotencyKey(crypto.randomUUID())
            setSubmissionStartedAt(Date.now())
          }}
        >
          {getInterfaceCopy(locale).BookingMessages.newRequest}
        </Button>
      )}
    </form>
  )
}

export { BookingForm }
