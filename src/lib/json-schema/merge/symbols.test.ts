import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { describe, expect, it } from "vitest";

import { createMerger } from "./merge.ts";

const { mergeSchemaDefinitions } = createMerger({
  getSchemaKeys: Reflect.ownKeys,
});

const sym = Symbol("extension");
const sym2 = Symbol("extension2");

declare module "json-schema" {
  interface JSONSchema7 {
    [sym]?: string
    [sym2]?: string
  }
}

function getProperty(result: JSONSchema7Definition, key: keyof JSONSchema7) {
  return typeof result === 'boolean' ? undefined : result[key]
}

describe("getSchemaKeys: Reflect.ownKeys", () => {
  it("preserves symbol from left schema", () => {
    const result = mergeSchemaDefinitions(
      { type: "string", [sym]: "left-value" },
      { title: "right" }
    );
    expect(result).toMatchObject({ type: "string", title: "right" });
    expect(getProperty(result, sym)).toBe("left-value");
  });

  it("preserves symbol from right schema", () => {
    const result = mergeSchemaDefinitions(
      { type: "string" },
      { title: "right", [sym]: "right-value" }
    );
    expect(result).toMatchObject({ type: "string", title: "right" });
    expect(getProperty(result, sym)).toBe("right-value");
  });

  it("merges symbol present in both schemas via defaultMerger", () => {
    const result = mergeSchemaDefinitions(
      { type: "string", [sym]: "left" },
      { title: "right", [sym]: "right" }
    );
    expect(result).toMatchObject({ type: "string", title: "right" });
    expect(getProperty(result, sym)).toBe("left");
  });

  it("preserves symbol keys from both schemas", () => {
    const result = mergeSchemaDefinitions(
      { type: "string", [sym]: "a" },
      { title: "right", [sym2]: "b" }
    );
    expect(result).toMatchObject({ type: "string", title: "right" });
    expect(getProperty(result, sym)).toBe("a");
    expect(getProperty(result, sym2)).toBe("b");
  });
});
