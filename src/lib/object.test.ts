import { describe, expect, it } from "vitest";

import { getOwn, setOwn } from "./object.ts";

describe("getOwn", () => {
  it("returns own properties", () => {
    expect(getOwn({ value: 1 }, "value")).toBe(1);
  });

  it("returns undefined for inherited properties", () => {
    const obj: Record<string, unknown> = {};
    expect(getOwn(obj, "constructor")).toBeUndefined();
    expect(getOwn(obj, "toString")).toBeUndefined();
  });
});

describe("setOwn", () => {
  it("writes regular properties", () => {
    const obj: Record<string, unknown> = {};
    setOwn(obj, "value", 1);
    expect(Object.hasOwn(obj, "value")).toBe(true);
    expect(obj.value).toBe(1);
  });

  it("writes `__proto__` as an own property", () => {
    const obj: Record<string, unknown> = {};
    setOwn(obj, "__proto__", { polluted: true });
    expect(Object.hasOwn(obj, "__proto__")).toBe(true);
    expect(Object.getPrototypeOf(obj)).toBe(Object.prototype);
    expect(obj.polluted).toBeUndefined();
  });
});
