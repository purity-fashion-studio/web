import { expect, it } from "vitest"
import { NotificationOutbox } from "@/payload/collections/NotificationOutbox"

it.each(["production", "preview", "development"])(
  "does not grant developer customer outbox access in %s",
  async (environment) => {
    const req = {
      user: { roles: ["developer"], active: true },
      payload: {},
      environment,
    }
    for (const recipientType of ["client", "internal"]) {
      expect(
        await NotificationOutbox.access!.read!({
          req,
          data: { recipientType },
        } as never)
      ).toBe(false)
      const field = NotificationOutbox.fields.find(
        (field) => "name" in field && field.name === "recipient"
      )!
      if (!("access" in field) || !field.access?.read)
        throw new Error("Missing recipient policy")
      expect(
        await field.access.read({ req, doc: { recipientType } } as never)
      ).toBe(false)
    }
  }
)
it.each(["owner", "support", "finance", "editor"])(
  "applies recipient policy for %s",
  async (role) => {
    const req = { user: { roles: [role], active: true } }
    expect(await NotificationOutbox.access!.read!({ req } as never)).toBe(
      ["owner", "support", "finance"].includes(role)
    )
    const field = NotificationOutbox.fields.find(
      (field) => "name" in field && field.name === "recipient"
    )!
    if (!("access" in field) || !field.access?.read)
      throw new Error("Missing recipient policy")
    expect(await field.access.read({ req } as never)).toBe(role === "owner")
  }
)
