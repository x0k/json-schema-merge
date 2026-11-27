import type { JSONSchema7 } from "json-schema";
import { describe, expect, it } from "vitest";

import { createMerger } from "./merge.ts";

const { mergeSchemaDefinitions } = createMerger();

const sym = Symbol("extension");
const sym2 = Symbol("extension2");

type SchemaWithSymbols = JSONSchema7 & {
  [sym]?: string;
  [sym2]?: string;
};

function schemaWithSymbols(schema: SchemaWithSymbols) {
  return schema;
}

describe("symbols", () => {
  it("preserves symbol from left schema", () => {
    const result = mergeSchemaDefinitions(
      schemaWithSymbols({ type: "string", [sym]: "left-value" }),
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
      schemaWithSymbols({ title: "right", [sym]: "right-value" })
    );
    expect(result).toEqual({
      type: "string",
      title: "right",
      [sym]: "right-value",
    });
  });

  it("merges symbol present in both schemas via defaultMerger", () => {
    const result = mergeSchemaDefinitions(
      schemaWithSymbols({ type: "string", [sym]: "left" }),
      schemaWithSymbols({ title: "right", [sym]: "right" })
    );
    expect(result).toEqual({
      type: "string",
      title: "right",
      [sym]: "left",
    });
  });

  it("preserves symbol keys from both schemas", () => {
    const result = mergeSchemaDefinitions(
      schemaWithSymbols({ type: "string", [sym]: "a" }),
      schemaWithSymbols({ title: "right", [sym2]: "b" })
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
      schemaWithSymbols({
        properties: {
          name: { type: "string", [sym]: "nested-left" } as SchemaWithSymbols,
        },
      }),
      schemaWithSymbols({
        properties: {
          name: {
            minLength: 3,
            [sym2]: "nested-right",
          } as SchemaWithSymbols,
        },
      })
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
