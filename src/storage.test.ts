import { afterEach, describe, expect, it, vi } from "vitest"
import { requestPersistentStorage } from "./storage"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("requestPersistentStorage", () => {
  it("does not fail where the browser has no storage manager", () => {
    vi.stubGlobal("navigator", {})
    expect(() => requestPersistentStorage()).not.toThrow()
  })
})
