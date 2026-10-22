import { expect, it, vi } from "vitest"

import { PortfolioCases } from "@/payload/collections/PortfolioCases"

it("public portfolio reads require at least one readable real proof asset", async () => {
  const find = vi.fn(async () => ({ docs: [{ id: "proof" }] }))
  const read = PortfolioCases.access?.read
  if (!read) throw new Error("Missing proof read policy")
  expect(await read({ req: { payload: { find } } } as never)).toMatchObject({
    and: expect.arrayContaining([{ media: { in: ["proof"] } }]),
  })
})

it("does not approve generated editorial filler as real client proof", async () => {
  const hook = PortfolioCases.hooks?.beforeValidate?.[0]
  if (!hook) throw new Error("Missing proof validation")
  const req = {
    payload: {
      findByID: vi.fn(async () => ({
        source: "generated",
        isRealClientProof: false,
        publicVisibility: true,
        usageRightsStatus: "approved",
      })),
    },
  }
  await expect(
    hook({
      data: {
        approvalStatus: "approved",
        isRealClientProof: true,
        usageRightsStatus: "approved",
        services: ["service"],
        media: ["generated"],
      },
      req,
    } as never)
  ).rejects.toThrow(/real client proof/i)
})
