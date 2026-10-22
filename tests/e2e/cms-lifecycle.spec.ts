import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import {
  expect,
  request as apiRequest,
  test,
  type APIRequestContext,
  type APIResponse,
  type Page,
} from "@playwright/test"
import { getPayload, type Payload } from "payload"
import { tsImport } from "tsx/esm/api"

import { assertIsolatedTestDatabase } from "../../scripts/test-database"

const prefix = `qa-browser-${randomUUID()}`
const password = `${randomUUID()}-Local-QA-only`
const fixtureBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
const locales = ["uk", "ru", "en"] as const
const accountIDs: string[] = []
let payload: Payload
let originalPageID: string
let originalUsers: number

test.beforeAll(async () => {
  assertIsolatedTestDatabase(process.env, fixtureBaseURL)
  // Local API fixture setup/cleanup has no Next request store. This worker's
  // flag does not change the separate HTTP server's real invalidation hooks.
  process.env.PAYLOAD_IMPORTING = "true"
  const { default: config } = (await tsImport(
    "../../payload.config.ts",
    import.meta.url
  )) as typeof import("../../payload.config")
  payload = await getPayload({ config })
  const identity = await payload.db.pool.query<{
    name: string
    address: string
  }>("SELECT current_database() AS name, host(inet_server_addr()) AS address")
  expect(identity.rows[0]?.name).toBe(process.env.PURITY_TEST_DATABASE)
  expect(["127.0.0.1", "::1"]).toContain(identity.rows[0]?.address)
  originalUsers = (
    await payload.count({ collection: "users", overrideAccess: true })
  ).totalDocs
  const owner = await payload.create({
    collection: "users",
    overrideAccess: true,
    data: {
      name: "QA Browser Owner",
      email: `${prefix}@example.com`,
      password,
      roles: ["owner"],
      active: true,
    },
  })
  accountIDs.push(owner.id)
  const editor = await payload.create({
    collection: "users",
    overrideAccess: false,
    user: { ...owner, collection: "users" },
    data: {
      name: "QA Browser Editor",
      email: `${prefix}-editor@example.com`,
      password,
      roles: ["editor"],
      active: true,
    },
  })
  accountIDs.push(editor.id)
  for (const [id, role] of [
    [owner.id, "owner"],
    [editor.id, "editor"],
  ] as const) {
    expect(
      (
        await payload.findByID({
          collection: "users",
          id,
          overrideAccess: true,
        })
      ).roles
    ).toEqual([role])
  }
  const original = await payload.find({
    collection: "pages",
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: { slug: { equals: "studio" } },
  })
  expect(original.docs).toHaveLength(1)
  originalPageID = original.docs[0]!.id
})

test.afterAll(async () => {
  if (!payload) return
  try {
    try {
      await cleanupPublicFixtures()
    } finally {
      for (const id of [...accountIDs].reverse())
        await payload.delete({ collection: "users", id, overrideAccess: true })
      expect(
        (await payload.count({ collection: "users", overrideAccess: true }))
          .totalDocs
      ).toBe(originalUsers)
      expect(
        (
          await payload.count({
            collection: "users",
            overrideAccess: true,
            where: { email: { contains: prefix } },
          })
        ).totalDocs
      ).toBe(0)
    }
  } finally {
    await payload.destroy()
    await Promise.race([
      payload.db.pool.end(),
      new Promise((resolve) => setTimeout(resolve, 100)),
    ])
  }
})

async function loginAPI(request: APIRequestContext, email: string) {
  let response
  try {
    response = await request.post("/api/users/login", {
      data: { email, password },
    })
  } catch {
    throw new Error("QA API login transport failed; credentials omitted")
  }
  expect(response.status()).toBe(200)
  const result = (await response.json()) as { token?: string }
  if (typeof result.token !== "string")
    throw new Error("QA login returned no token")
  return result.token
}

async function loginUI(page: Page, email: string) {
  await page.goto("/admin/login")
  try {
    await page.getByLabel(/email/i).first().fill(email)
    await page
      .getByLabel(/^password/i)
      .first()
      .fill(password)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(
      (url) =>
        url.pathname.startsWith("/admin") && !url.pathname.includes("login")
    )
  } catch {
    throw new Error("Temporary QA admin login failed; credentials omitted.")
  }
}

async function writeCMS(
  request: APIRequestContext,
  method: "post" | "patch",
  path: string,
  token: string,
  data: Record<string, unknown>
) {
  let response
  try {
    response = await request[method](path, {
      headers: { Authorization: `JWT ${token}` },
      data,
    })
  } catch {
    throw new Error("QA CMS transport failed; credentials omitted")
  }
  if (!response.ok()) {
    const error = (await response.json()) as {
      errors?: Array<{ message?: string }>
    }
    throw new Error(
      `QA CMS write failed (${response.status()}): ${(error.errors ?? []).map(({ message }) => message).join("; ")}`
    )
  }
  expect(response.status()).toBe(method === "post" ? 201 : 200)
  const result = (await response.json()) as {
    doc?: { id: string } & Record<string, unknown>
  }
  if (typeof result.doc?.id !== "string")
    throw new Error("QA CMS response returned no document")
  return result.doc
}

async function cleanupPublicFixtures() {
  const request = await apiRequest.newContext({ baseURL: fixtureBaseURL })
  const failures: string[] = []
  try {
    for (const collection of ["pages", "redirects", "media"] as const) {
      const where = {
        [collection === "redirects"
          ? "from"
          : collection === "media"
            ? "internalLabel"
            : "legacyKey"]: {
          contains: prefix,
        },
      }
      const records = await payload.find({
        collection,
        overrideAccess: true,
        pagination: false,
        depth: 0,
        where,
      })
      try {
        if (records.docs.length) {
          const token = await loginAPI(request, `${prefix}@example.com`)
          for (const record of records.docs) {
            const response = await request.delete(
              `/api/${collection}/${record.id}`,
              { headers: { Authorization: `JWT ${token}` } }
            )
            expect(response.status()).toBe(200)
          }
        }
      } catch {
        failures.push(collection)
      } finally {
        // Preserve physical cleanup if HTTP invalidation fails, but keep that
        // failed cleanup observable as a failing suite, not a green fallback.
        await payload.delete({ collection, overrideAccess: true, where })
      }
      expect(
        (await payload.count({ collection, overrideAccess: true, where }))
          .totalDocs
      ).toBe(0)
    }
  } finally {
    await request.dispose()
  }
  if (failures.length)
    throw new Error(`HTTP fixture cleanup failed: ${failures.join(", ")}`)
}

async function expectMissingPage(
  response: APIResponse,
  locale: (typeof locales)[number]
) {
  // A streamed Next not-found response can be HTTP 200. Prove its active 404
  // boundary and private-content exclusion; check browser rendering separately.
  expect([200, 404]).toContain(response.status())
  const html = await response.text()
  expect(html.includes("NEXT_HTTP_ERROR_FALLBACK;404")).toBe(true)
  expect(html.includes("This page could not be found.")).toBe(true)
  expect(html).not.toContain(`${locale} ${prefix} title`)
}

function pageFields(locale: (typeof locales)[number], mediaID?: string) {
  return {
    title: `${locale} ${prefix} title`,
    summary: `${locale} ${prefix} summary`,
    body: `${locale} ${prefix} body`,
    cta: { label: "QA booking", action: "booking-request" },
    meta: {
      title: "QA page",
      description: "Synthetic local QA page, not approved site content.",
    },
    layout: [
      {
        blockType: "richText",
        heading: `${locale} ${prefix} section`,
        body: "Synthetic local QA editorial content.",
      },
      ...(mediaID
        ? [
            {
              blockType: "mediaText",
              heading: `${locale} ${prefix} image section`,
              body: "Synthetic local uploaded-media fixture.",
              media: mediaID,
              mediaPosition: "end",
            },
          ]
        : []),
    ],
  }
}

test("a temporary owner can log into the real admin UI and log out", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000)
  await loginUI(page, `${prefix}@example.com`)
  await expect(
    page.getByRole("heading", { name: "Administration", exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath("admin-owner.png"),
    fullPage: true,
  })
  await page.goto(`/admin/collections/pages/${originalPageID}?locale=en`)
  await expect(page.getByLabel(/^Title/).first()).toBeVisible()
  await expect(page.locator("#live-preview-toggler")).toBeVisible()
  const logoutStatus = await page.evaluate(
    async () =>
      (
        await fetch("/api/users/logout", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        })
      ).status
  )
  expect(logoutStatus).toBe(200)
  await page.goto("/admin")
  await expect(page.getByLabel(/email/i).first()).toBeVisible()
})

test("editor changes publish and disappear through real HTTP caches in all locales", async ({
  request,
  browser,
}) => {
  test.setTimeout(120_000)
  const token = await loginAPI(request, `${prefix}-editor@example.com`)
  const anonymous = await browser.newContext({ baseURL: fixtureBaseURL })
  const slug = `${prefix}-page`
  try {
    await expectMissingPage(await anonymous.request.get(`/en/${slug}`), "en")
    const screen = await anonymous.newPage()
    await screen.goto(`/en/${slug}`)
    await expect(
      screen.getByRole("heading", { name: "404", exact: true })
    ).toBeVisible()
    const page = await writeCMS(
      request,
      "post",
      "/api/pages?locale=uk&draft=true",
      token,
      {
        legacyKey: slug,
        slug,
        pageType: "cookies",
        enabled: true,
        ...pageFields("uk"),
      }
    )
    expect(
      (await anonymous.request.get(`/api/pages/${page.id}?draft=true`)).status()
    ).toBe(404)
    await expectMissingPage(await anonymous.request.get(`/uk/${slug}`), "uk")
    for (const locale of ["ru", "en"] as const)
      await writeCMS(
        request,
        "patch",
        `/api/pages/${page.id}?locale=${locale}&draft=true`,
        token,
        pageFields(locale)
      )
    await writeCMS(request, "patch", `/api/pages/${page.id}?locale=en`, token, {
      _status: "published",
    })
    for (const locale of locales) {
      const publicPage = await anonymous.request.get(`/${locale}/${slug}`)
      expect(publicPage.status()).toBe(200)
      const html = await publicPage.text()
      expect(html).toContain(`${locale} ${prefix} title`)
      expect(html).toContain(`${locale} ${prefix} section`)
    }
    await screen.goto(`/en/${slug}`)
    await expect(
      screen.getByRole("heading", { name: `en ${prefix} section`, exact: true })
    ).toBeVisible()
    await writeCMS(request, "patch", `/api/pages/${page.id}?locale=en`, token, {
      _status: "draft",
    })
    for (const locale of locales)
      await expectMissingPage(
        await anonymous.request.get(`/${locale}/${slug}`),
        locale
      )
  } finally {
    await anonymous.close()
  }
})

test("new uploads render after startup and revoked media disappears from cached pages", async ({
  request,
  browser,
}) => {
  test.setTimeout(120_000)
  const token = await loginAPI(request, `${prefix}-editor@example.com`)
  const anonymous = await browser.newContext({ baseURL: fixtureBaseURL })
  try {
    let uploaded
    try {
      uploaded = await request.post("/api/media?locale=uk", {
        headers: { Authorization: `JWT ${token}` },
        multipart: {
          _payload: JSON.stringify({
            internalLabel: `${prefix}-upload`,
            alt: `uk ${prefix} image`,
            source: "generated",
            replacementPriority: "replace-before-launch",
            isRealClientProof: true,
            usageRightsStatus: "approved",
            publicVisibility: true,
            sourceMetadata: `${prefix}-private-source-reference`,
          }),
          file: {
            name: `${prefix}.png`,
            mimeType: "image/png",
            buffer: await readFile("public/brand/logo-mark-grey.png"),
          },
        },
      })
    } catch {
      throw new Error("QA media upload transport failed; credentials omitted")
    }
    expect(uploaded.status()).toBe(201)
    const { doc: media } = (await uploaded.json()) as {
      doc: { id: string; filename: string; isRealClientProof: boolean }
    }
    expect(typeof media.id).toBe("string")
    expect(media.isRealClientProof).toBe(false)
    for (const locale of ["ru", "en"] as const)
      await writeCMS(
        request,
        "patch",
        `/api/media/${media.id}?locale=${locale}`,
        token,
        { alt: `${locale} ${prefix} image` }
      )
    const publicMedia = await anonymous.request.get(`/api/media/${media.id}`)
    expect(publicMedia.status()).toBe(200)
    expect((await publicMedia.json()).sourceMetadata).toBeUndefined()
    const slug = `${prefix}-media-page`
    const page = await writeCMS(
      request,
      "post",
      "/api/pages?locale=uk&draft=true",
      token,
      {
        legacyKey: slug,
        slug,
        pageType: "cookies",
        enabled: true,
        ...pageFields("uk", media.id),
      }
    )
    for (const locale of ["ru", "en"] as const)
      await writeCMS(
        request,
        "patch",
        `/api/pages/${page.id}?locale=${locale}&draft=true`,
        token,
        pageFields(locale, media.id)
      )
    await writeCMS(request, "patch", `/api/pages/${page.id}?locale=en`, token, {
      _status: "published",
    })
    const screen = await anonymous.newPage()
    await screen.goto(`/en/${slug}`)
    const image = screen.getByRole("img", {
      name: `en ${prefix} image`,
      exact: true,
    })
    await expect(image).toHaveCount(1)
    await image.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth)
      )
      .toBeGreaterThan(0)
    await writeCMS(
      request,
      "patch",
      `/api/media/${media.id}?locale=en`,
      token,
      {
        publicVisibility: false,
      }
    )
    await screen.reload()
    await expect(
      screen.getByRole("heading", { name: `en ${prefix} title`, exact: true })
    ).toBeVisible()
    await expect(
      screen.getByRole("img", { name: `en ${prefix} image`, exact: true })
    ).toHaveCount(0)
    expect([401, 403, 404]).toContain(
      (await anonymous.request.get(`/api/media/${media.id}`)).status()
    )
    expect([401, 403, 404]).toContain(
      (
        await anonymous.request.get(`/api/media/file/${media.filename}`)
      ).status()
    )
  } finally {
    await anonymous.close()
  }
})

test("the real CMS preview refreshes a saved draft without publishing it", async ({
  request,
  page,
  browser,
}) => {
  test.setTimeout(120_000)
  const token = await loginAPI(request, `${prefix}-editor@example.com`)
  const slug = `${prefix}-preview`
  const record = await writeCMS(
    request,
    "post",
    "/api/pages?locale=uk&draft=true",
    token,
    {
      legacyKey: slug,
      slug,
      pageType: "cookies",
      enabled: true,
      ...pageFields("uk"),
    }
  )
  for (const locale of ["ru", "en"] as const)
    await writeCMS(
      request,
      "patch",
      `/api/pages/${record.id}?locale=${locale}&draft=true`,
      token,
      pageFields(locale)
    )
  await writeCMS(request, "patch", `/api/pages/${record.id}?locale=en`, token, {
    _status: "published",
  })
  const anonymous = await browser.newContext({ baseURL: fixtureBaseURL })
  try {
    await loginUI(page, `${prefix}-editor@example.com`)
    await page.goto(`/admin/collections/pages/${record.id}?locale=en`)
    await page.locator("#live-preview-toggler").click()
    await expect(page.locator("iframe")).toHaveCount(1)
    const preview = page.frameLocator("iframe")
    await expect(
      preview.getByText("Draft preview is enabled", { exact: true })
    ).toBeVisible()
    await expect(
      preview.getByRole("heading", { name: `en ${prefix} title`, exact: true })
    ).toBeVisible()
    const draftTitle = `en ${prefix} saved draft`
    const saved = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === `/api/pages/${record.id}` &&
        response.request().method() === "PATCH" &&
        response.ok()
    )
    await page
      .getByLabel(/^Title/)
      .first()
      .fill(draftTitle)
    await saved
    await expect(
      preview.getByRole("heading", { name: draftTitle, exact: true })
    ).toBeVisible()
    const publicRecord = await anonymous.request.get(
      `/api/pages/${record.id}?locale=en`
    )
    expect(publicRecord.status()).toBe(200)
    expect((await publicRecord.json()).title).toBe(`en ${prefix} title`)
    const publicHTML = await (await anonymous.request.get(`/en/${slug}`)).text()
    expect(publicHTML.includes(draftTitle)).toBe(false)
    expect(publicHTML.includes(`en ${prefix} title`)).toBe(true)
    await preview
      .getByRole("button", { name: "Exit preview", exact: true })
      .click()
    await expect(
      preview.getByText("Draft preview is enabled", { exact: true })
    ).toHaveCount(0)
  } finally {
    await anonymous.close()
  }
})
