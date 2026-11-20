import { describe, expect, it } from "vitest";

import { createMerger } from "./merge.ts";

const customSymbol = Symbol("custom");

declare module "json-schema" {
  interface JSONSchema7 {
    "x-custom"?: string;
    [customSymbol]?: string;
  }
}

describe("unknownMerger option", () => {
  it("merges unknown keywords and passes the key", () => {
    const keys: (string | symbol)[] = [];
    const { mergeSchemaDefinitions } = createMerger({
      unknownMerger: (a, b, key) => {
        keys.push(key);
        return b;
      },
    });

    expect(
      mergeSchemaDefinitions({ "x-custom": "left" }, { "x-custom": "right" })
    ).toEqual({ "x-custom": "right" });
    expect(keys).toEqual(["x-custom"]);
  });

  it("passes symbol keys to the unknown merger", () => {
    const keys: (string | symbol)[] = [];
    const { mergeSchemaDefinitions } = createMerger({
      unknownMerger: (a, b, key) => {
        keys.push(key);
        return b;
      },
    });

    expect(
      mergeSchemaDefinitions(
        { type: "object", [customSymbol]: "left" },
        { type: "object", [customSymbol]: "right" }
      )
    ).toEqual({ type: "object", [customSymbol]: "right" });
    expect(keys).toEqual([customSymbol]);
  });

  it("defaults to defaultMerger", () => {
    const { mergeSchemaDefinitions } = createMerger({
      defaultMerger: (_a, b) => b,
    });

    expect(
      mergeSchemaDefinitions({ "x-custom": "left" }, { "x-custom": "right" })
    ).toEqual({ "x-custom": "right" });
  });

  it("is only used when no keyword-specific merger exists", () => {
    const keys: (string | symbol)[] = [];
    const { mergeSchemaDefinitions } = createMerger({
      defaultMerger: (_a, b) => b,
      unknownMerger: (a, b, key) => {
        keys.push(key);
        return b;
      },
    });

    expect(
      mergeSchemaDefinitions(
        { description: "left", "x-custom": "left" },
        { description: "right", "x-custom": "right" }
      )
    ).toEqual({ description: "right", "x-custom": "right" });
    expect(keys).toEqual(["x-custom"]);
  });

  it("does not override a specific merger", () => {
    const keys: (string | symbol)[] = [];
    const { mergeSchemaDefinitions } = createMerger({
      unknownMerger: (a, b, key) => {
        keys.push(key);
        return b;
      },
      mergers: {
        "x-custom": (a, b) => `${a}/${b}`,
      },
    });

    expect(
      mergeSchemaDefinitions({ "x-custom": "left" }, { "x-custom": "right" })
    ).toEqual({ "x-custom": "left/right" });
    expect(keys).toEqual([]);
  });

  it("keeps the default identity behavior when omitted", () => {
    const { mergeSchemaDefinitions } = createMerger();

    expect(
      mergeSchemaDefinitions({ "x-custom": "left" }, { "x-custom": "right" })
    ).toEqual({ "x-custom": "left" });
  });
});
