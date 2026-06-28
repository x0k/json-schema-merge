import { describe, expect, it } from "vitest";

import { createMerger } from "./merge.ts";

const { mergeSchemaDefinitions } = createMerger();

const sym = Symbol("extension");
const sym2 = Symbol("extension2");

declare module "json-schema" {
  interface JSONSchema7 {
    [sym]?: string;
    [sym2]?: string;
  }
}

describe("symbols", () => {
  it("preserves symbol from left schema", () => {
    const result = mergeSchemaDefinitions(
      { type: "string", [sym]: "left-value" },
      { title: "right" }
    );
    expect(result).toEqual({
      type: "string",
      title: "right",
      [sym]: "left-value",
    });
  });

  it("preserves symbol from right schema", () => {
    const result = mergeSchemaDefinitions(
      { type: "string" },
      { title: "right", [sym]: "right-value" }
    );
    expect(result).toEqual({
      type: "string",
      title: "right",
      [sym]: "right-value",
    });
  });

  it("merges symbol present in both schemas via defaultMerger", () => {
    const result = mergeSchemaDefinitions(
      { type: "string", [sym]: "left" },
      { title: "right", [sym]: "right" }
    );
    expect(result).toEqual({
      type: "string",
      title: "right",
      [sym]: "left",
    });
  });

  it("preserves symbol keys from both schemas", () => {
    const result = mergeSchemaDefinitions(
      { type: "string", [sym]: "a" },
      { title: "right", [sym2]: "b" }
    );
    expect(result).toEqual({
      type: "string",
      title: "right",
      [sym]: "a",
      [sym2]: "b",
    });
  });

  it("preserves symbols in nested schemas", () => {
    const result = mergeSchemaDefinitions(
      {
        properties: {
          name: { type: "string", [sym]: "nested-left" },
        },
      },
      {
        properties: {
          name: { minLength: 3, [sym2]: "nested-right" },
        },
      }
    );
    expect(result).toEqual({
      properties: {
        name: {
          type: "string",
          minLength: 3,
          [sym]: "nested-left",
          [sym2]: "nested-right",
        },
      },
    });
  });
});
