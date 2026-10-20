import { describe, expect, it } from "vitest"

import {
  definedIDs,
  localizedObject,
  mergeGlobalData,
  serviceFormatLabel,
  serviceFormats,
} from "../../payload/seed/import-transforms"

describe("seed import transforms", () => {
  it("builds all localized variants without sharing nested objects", () => {
    const result = localizedObject((locale) => ({
      label: locale,
      nested: { locale },
    }))

    expect(Object.keys(result)).toEqual(["uk", "ru", "en"])
    expect(result.uk.label).toBe("uk")
    expect(result.ru.nested).not.toBe(result.en.nested)
  })

  it("merges localized nested objects while preserving common fields", () => {
    expect(
      mergeGlobalData(
        { shared: "yes", labels: { close: "Close", menu: "Menu" } },
        { labels: { close: "Закрити" }, title: "Заголовок" }
      )
    ).toEqual({
      shared: "yes",
      labels: { close: "Закрити", menu: "Menu" },
      title: "Заголовок",
    })
  })

  it("keeps only defined IDs and applies domain format rules", () => {
    expect(definedIDs(["one", undefined, "two"])).toEqual(["one", "two"])
    expect(serviceFormats("atelier-service")).toEqual([
      "studio",
      "remote-atelier",
    ])
    expect(serviceFormats("corporate-styling")).toEqual(["in-person", "hybrid"])
    expect(serviceFormatLabel("studio", "ru")).toBe("В студии")
    expect(serviceFormatLabel("unknown", "en")).toBe("unknown")
  })
})
