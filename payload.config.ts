import { postgresAdapter } from "@payloadcms/db-postgres"
import { resendAdapter } from "@payloadcms/email-resend"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import { redirectsPlugin } from "@payloadcms/plugin-redirects"
import { seoPlugin } from "@payloadcms/plugin-seo"
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildConfig } from "payload"
import sharp from "sharp"

import { BookingRequests } from "./payload/collections/BookingRequests"
import { Courses } from "./payload/collections/Courses"
import { Directions } from "./payload/collections/Directions"
import { FashionCollections } from "./payload/collections/FashionCollections"
import { Leads } from "./payload/collections/Leads"
import { Media } from "./payload/collections/Media"
import { NotificationOutbox } from "./payload/collections/NotificationOutbox"
import { Offers } from "./payload/collections/Offers"
import { Pages } from "./payload/collections/Pages"
import { PaymentOrders } from "./payload/collections/PaymentOrders"
import { PortfolioCases } from "./payload/collections/PortfolioCases"
import { Services } from "./payload/collections/Services"
import { Testimonials } from "./payload/collections/Testimonials"
import { Users } from "./payload/collections/Users"
import { WebhookEvents } from "./payload/collections/WebhookEvents"
import { contentManagers, ownerOnly } from "./payload/access"
import { BookingSettings } from "./payload/globals/BookingSettings"
import { Footer } from "./payload/globals/Footer"
import { Header } from "./payload/globals/Header"
import { Home } from "./payload/globals/Home"
import { SiteSettings } from "./payload/globals/SiteSettings"
import { env } from "./lib/env"
import { getPayloadURL, getSiteURL } from "./lib/site-url"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const payloadSecret =
  env.PAYLOAD_SECRET ??
  "cms-disabled-build-only-secret-replace-before-runtime-use"

const siteURL = getSiteURL()
const payloadURL = getPayloadURL()
const allowedOrigins = [...new Set([siteURL, payloadURL])]
const blobStorageEnabled =
  Boolean(env.BLOB_READ_WRITE_TOKEN) &&
  env.PAYLOAD_DISABLE_BLOB_STORAGE !== "true"

function secureDatabaseURL(value: string): string {
  const url = new URL(value)

  if (
    ["prefer", "require", "verify-ca"].includes(
      url.searchParams.get("sslmode") ?? ""
    )
  ) {
    url.searchParams.set("sslmode", "verify-full")
  }

  return url.toString()
}

const databaseURL = secureDatabaseURL(
  env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/purity"
)

const previewRoutes: Record<string, string> = {
  directions: "",
  services: "/services",
  courses: "/courses",
  "fashion-collections": "/collections",
  "portfolio-cases": "/portfolio",
  pages: "",
}

function getPublicURL({
  collectionSlug,
  doc,
  locale = "uk",
}: {
  collectionSlug?: string
  doc: Record<string, unknown>
  locale?: string
}): string {
  if (!collectionSlug || typeof doc.slug !== "string") return `/${locale}`

  return `/${locale}${previewRoutes[collectionSlug] ?? ""}/${doc.slug}`
}

function getPreviewURL(args: Parameters<typeof getPublicURL>[0]): string {
  const url = new URL("/api/preview", siteURL)
  url.searchParams.set("secret", env.PREVIEW_SECRET ?? "disabled")
  url.searchParams.set("path", getPublicURL(args))
  return url.toString()
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: dirname,
    },
    livePreview: {
      url: ({ collectionConfig, data, locale }) =>
        getPreviewURL({
          collectionSlug: collectionConfig?.slug,
          doc: data,
          locale: locale?.code,
        }),
      collections: [
        "directions",
        "services",
        "courses",
        "fashion-collections",
        "portfolio-cases",
        "pages",
      ],
      globals: ["home"],
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 390, height: 844 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },
  collections: [
    Users,
    Media,
    Directions,
    Services,
    Offers,
    Courses,
    FashionCollections,
    PortfolioCases,
    Testimonials,
    Pages,
    Leads,
    BookingRequests,
    PaymentOrders,
    WebhookEvents,
    NotificationOutbox,
  ],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  db: postgresAdapter({
    idType: "uuid",
    migrationDir: path.resolve(dirname, "payload/migrations"),
    pool: { connectionString: databaseURL },
    push: env.NODE_ENV === "development",
  }),
  editor: lexicalEditor(),
  email:
    env.EMAIL_MODE === "offline" || env.EMAIL_MODE === "disabled"
      ? () => ({
          name:
            env.EMAIL_MODE === "offline"
              ? "offline-no-send"
              : "preview-no-send",
          defaultFromAddress:
            env.EMAIL_MODE === "disabled" ? "" : env.EMAIL_FROM!,
          defaultFromName: "PURITY Fashion Studio",
          sendEmail: async () => {
            throw new Error(
              env.EMAIL_MODE === "offline"
                ? "Email delivery disabled in offline mode"
                : "Email delivery disabled in preview mode"
            )
          },
        })
      : resendAdapter({
          apiKey: env.RESEND_API_KEY ?? "re_payload_disabled",
          defaultFromAddress: env.EMAIL_FROM ?? "disabled@invalid.local",
          defaultFromName: "PURITY Fashion Studio",
          overrideRecipientAddress:
            env.VERCEL_ENV === "production"
              ? undefined
              : env.EMAIL_OVERRIDE_RECIPIENT,
        }),
  graphQL: { disable: true },
  globals: [Home, Header, Footer, SiteSettings, BookingSettings],
  localization: {
    defaultLocale: "uk",
    defaultLocalePublishOption: "all",
    fallback: false,
    locales: [
      { code: "uk", label: "Українська" },
      { code: "ru", label: "Русский" },
      { code: "en", label: "English" },
    ],
  },
  maxDepth: 5,
  plugins: [
    seoPlugin({
      collections: [
        "directions",
        "services",
        "courses",
        "fashion-collections",
        "portfolio-cases",
        "pages",
      ],
      fields: ({ defaultFields }) =>
        defaultFields.map((field) =>
          "name" in field && ["title", "description"].includes(field.name)
            ? { ...field, localized: true }
            : field
        ),
      generateDescription: ({ doc }) => doc.summary,
      generateTitle: ({ doc }) => doc.title,
      generateURL: ({ collectionConfig, doc, locale }) => {
        const relativeURL = getPublicURL({
          collectionSlug: collectionConfig?.slug,
          doc,
          locale,
        })
        return new URL(relativeURL, siteURL).toString()
      },
      globals: ["home"],
      tabbedUI: true,
      uploadsCollection: "media",
    }),
    redirectsPlugin({
      collections: [
        "directions",
        "services",
        "courses",
        "fashion-collections",
        "portfolio-cases",
        "pages",
      ],
      overrides: {
        access: {
          create: contentManagers,
          delete: ownerOnly,
          read: () => true,
          update: contentManagers,
        },
        admin: { group: "Site" },
      },
      redirectTypes: ["301", "302"],
    }),
    vercelBlobStorage({
      alwaysInsertFields: true,
      clientUploads: true,
      collections: { media: true },
      enabled: blobStorageEnabled,
      token: env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  secret: payloadSecret,
  serverURL: payloadURL,
  sharp,
  telemetry: false,
  upload: {
    abortOnLimit: true,
    limits: { fileSize: 20 * 1024 * 1024, files: 1 },
    responseOnLimit: "Upload exceeds the 20 MB media limit.",
    safeFileNames: true,
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
})
