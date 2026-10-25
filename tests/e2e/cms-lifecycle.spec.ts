import { randomUUID } from "node:crypto"
const notFoundCopy = {
  uk: { title: "Сторінку не знайдено", home: "На головну" },
  ru: { title: "Страница не найдена", home: "На главную" },
  en: { title: "Page not found", home: "Back to home" },
} as const
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

import {
  assertIsolatedDatabaseIdentity,
  assertIsolatedTestDatabase,
} from "../../scripts/test-database"

const prefix = `qa-browser-${randomUUID()}`
const password = `${randomUUID()}-Local-QA-only`
const fixtureBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"
const locales = ["uk", "ru", "en"] as const
const accountIDs: string[] = []
let payload: Payload
let databaseVerified = false
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
  // This file owns and closes its pool; never reuse another suite's singleton.
  payload = await getPayload({ config, key: prefix })
  const identity = await payload.db.pool.query<{
    name: string
    address: string
  }>("SELECT current_database() AS name, host(inet_server_addr()) AS address")
  assertIsolatedDatabaseIdentity(identity.rows[0])
  databaseVerified = true
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
    if (!databaseVerified) return
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
  expect(html).toContain(notFoundCopy[locale].title)
  // A streamed fallback is serialized in the RSC payload before hydration.
  // Require its exact marker here, then prove the active DOM below.
  expect(html.replaceAll('\\"', '"')).toMatch(
    /data-testid(?:"\s*:\s*|=)"not-found"/
  )
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

test("saved global drafts stay private through anonymous HTTP while published content and trusted reads work", async ({
  request,
  browser,
}) => {
  const token = await loginAPI(request, `${prefix}-editor@example.com`)
  const anonymous = await browser.newContext({ baseURL: fixtureBaseURL })
  try {
    for (const [slug, field] of [
      ["home", "heroTitle"],
      ["header", "bookingLabel"],
      ["footer", "address"],
    ] as const) {
      const published = await payload.findGlobal({
        slug,
        locale: "en",
        depth: 0,
        overrideAccess: true,
      })
      const draft = await payload.findGlobal({
        slug,
        locale: "en",
        depth: 0,
        draft: true,
        overrideAccess: true,
      })
      const write = (data: object, draftFlag = false) =>
        request.post(`/api/globals/${slug}?locale=en&draft=${draftFlag}`, {
          headers: { Authorization: `JWT ${token}` },
          data,
        })
      try {
        expect(
          (
            await write({
              [field]: `${prefix} published`,
              _status: "published",
            })
          ).status()
        ).toBe(200)
        expect(
          (
            await write({ [field]: `${prefix} secret`, _status: "draft" }, true)
          ).status()
        ).toBe(200)
        const publicRead = await anonymous.request.get(
          `/api/globals/${slug}?locale=en&draft=false`
        )
        expect(publicRead.status()).toBe(200)
        expect((await publicRead.json())[field]).toBe(`${prefix} published`)
        const denied = await anonymous.request.get(
          `/api/globals/${slug}?locale=en&draft=true`
        )
        expect(denied.status()).toBe(403)
        expect(await denied.text()).not.toContain(`${prefix} secret`)
        const importer = await payload.findGlobal({
          slug,
          locale: "en",
          draft: true,
          overrideAccess: true,
        })
        expect(importer[field as keyof typeof importer]).toBe(
          `${prefix} secret`
        )
      } finally {
        expect((await write(published)).status()).toBe(200)
        expect((await write(draft, true)).status()).toBe(200)
      }
    }
  } finally {
    await anonymous.close()
  }
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
    const diagnostics: string[] = []
    screen.on("pageerror", (error) =>
      diagnostics.push(error.stack ?? error.message)
    )
    screen.on("console", (message) => {
      if (/content.security.policy|violates.*directive/i.test(message.text()))
        diagnostics.push(message.text())
    })
    for (const locale of locales) {
      await screen.goto(`/${locale}/${slug}`)
      await expect(
        screen.getByTestId("not-found").getByRole("heading", {
          name: notFoundCopy[locale].title,
          exact: true,
        })
      ).toBeVisible()
    }
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
    for (const locale of locales) {
      await expectMissingPage(
        await anonymous.request.get(`/${locale}/${slug}`),
        locale
      )
      await screen.goto(`/${locale}/${slug}`)
      const boundary = screen.getByTestId("not-found")
      await expect(
        boundary.getByRole("heading", {
          name: notFoundCopy[locale].title,
          exact: true,
        })
      ).toBeVisible()
      await boundary
        .getByRole("link", {
          name: notFoundCopy[locale].home,
          exact: true,
        })
        .click()
      await expect(screen).toHaveURL(new RegExp(`/${locale}$`))
      await expect(screen.getByTestId("not-found")).toHaveCount(0)
    }
    expect(diagnostics).toEqual([])
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
    const invalid = await request.post("/api/media?locale=uk", {
      headers: { Authorization: `JWT ${token}` },
      multipart: {
        _payload: JSON.stringify({
          internalLabel: `${prefix}-invalid`,
          alt: "Invalid generated fixture",
          source: "generated",
          replacementPriority: "none",
        }),
        file: {
          name: `${prefix}-invalid.png`,
          mimeType: "image/png",
          buffer: await readFile("public/brand/logo-mark-grey.png"),
        },
      },
    })
    expect(invalid.status()).toBe(400)
    expect((await invalid.json()).errors[0].data.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "replacementPriority" }),
      ])
    )
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
      doc: {
        id: string
        filename: string
        isRealClientProof: boolean
        sizes?: Record<string, { filename?: string | null }>
      }
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
    // Exercise the actual production optimizer, not CI's unoptimized mode.
    // Remember every delivery URL before revocation, including generated files.
    expect(Object.values(media.sizes ?? {}).some((size) => size.filename)).toBe(
      true
    )
    if (process.env.CI !== "true") {
      const brandURL =
        "/_next/image?url=%2Fbrand%2Flogo-mark-grey.png&w=640&q=75"
      expect((await anonymous.request.get(brandURL)).status()).toBe(200)
      // A warm entry may be stale from an earlier run. Let the real optimizer
      // finish its asynchronous revalidation, then require an actual cache HIT.
      const cacheStates: string[] = []
      await expect
        .poll(async () => {
          const response = await anonymous.request.get(brandURL)
          expect(response.status()).toBe(200)
          const cache = response.headers()["x-nextjs-cache"]
          cacheStates.push(cache)
          return cache
        })
        .toBe("HIT")
      await test.info().attach("brand-optimizer-cache", {
        body: JSON.stringify(cacheStates),
        contentType: "application/json",
      })
    }
    const deliveryURLs = new Set([
      await image.evaluate(
        (element) => (element as HTMLImageElement).currentSrc
      ),
      `/api/media/file/${media.filename}`,
      ...Object.values(media.sizes ?? {})
        .filter((size) => size.filename)
        .map((size) => `/api/media/file/${size.filename}`),
    ])
    const noStoreHeaders = (response: APIResponse) => {
      expect(response.headers()["cache-control"]).toContain("private, no-store")
      expect(response.headers()["cdn-cache-control"]).toBe("no-store")
      expect(response.headers()["vercel-cdn-cache-control"]).toBe("no-store")
    }
    for (const url of [...deliveryURLs]) {
      const direct = await anonymous.request.get(url)
      expect(direct.status()).toBe(200)
      noStoreHeaders(direct)
      const range = await anonymous.request.get(url, {
        headers: { Range: "bytes=0-31" },
      })
      expect(range.status()).toBe(206)
      expect((await range.body()).length).toBe(32)
      noStoreHeaders(range)
      const conditional = await anonymous.request.get(url, {
        headers: {
          "If-None-Match": direct.headers().etag ?? '"previous-public-copy"',
        },
      })
      // Local Payload streams 200; Blob can return 304 after its ACL check.
      expect([200, 304]).toContain(conditional.status())
      noStoreHeaders(conditional)
      const parsedURL = new URL(url, fixtureBaseURL)
      const source =
        parsedURL.pathname === "/_next/image"
          ? parsedURL.searchParams.get("url")!
          : parsedURL.pathname
      const optimized = `/_next/image?${new URLSearchParams({ url: source, w: "640", q: "75" })}`
      const response = await anonymous.request.get(optimized)
      // Static-only optimizer policies reject CMS URLs even before revocation.
      expect(response.status()).toBe(process.env.CI === "true" ? 404 : 400)
      deliveryURLs.add(optimized)
    }
    await writeCMS(
      request,
      "patch",
      `/api/media/${media.id}?locale=en`,
      token,
      {
        publicVisibility: false,
      }
    )
    const freshAnonymous = await apiRequest.newContext({
      baseURL: fixtureBaseURL,
    })
    try {
      for (const url of deliveryURLs) {
        const replay = await freshAnonymous.get(url)
        expect(
          replay.status(),
          `revoked delivery ${url}`
        ).toBeGreaterThanOrEqual(400)
        if (
          new URL(url, fixtureBaseURL).pathname.startsWith("/api/media/file/")
        ) {
          noStoreHeaders(replay)
          const conditionalHeaders: Record<string, string>[] = [
            { Range: "bytes=0-31" },
            { "If-None-Match": '"previous-public-copy"' },
          ]
          for (const headers of conditionalHeaders) {
            const denied = await freshAnonymous.get(url, { headers })
            expect([401, 403, 404]).toContain(denied.status())
            noStoreHeaders(denied)
          }
        }
      }
    } finally {
      await freshAnonymous.dispose()
    }
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
