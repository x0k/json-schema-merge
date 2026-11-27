import type { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { describe, expect, it } from "vitest";

import { isAllowAnySchema } from "../json-schema.ts";
import {
  createMerger,
  ITEMS_ASSIGNER_KEYS,
  PROPERTIES_ASSIGNER_KEYS,
} from "./merge.ts";

const UNEVALUATED_BLOCKERS = [
  "allOf",
  "anyOf",
  "oneOf",
  "if",
  "then",
  "else",
  "dependentSchemas",
  "$ref",
  "$dynamicRef",
  "$recursiveRef",
] as const;

function hasBlockers(schema: JSONSchema7): boolean {
  return (
    UNEVALUATED_BLOCKERS.some(
      (key) => Reflect.get(schema, key) !== undefined
    ) ||
    (schema.dependencies !== undefined &&
      Object.values(schema.dependencies).some((d) => !Array.isArray(d)))
  );
}

function rewriteUnevaluated(schema: JSONSchema7): JSONSchema7 {
  const unevaluated: unknown = Reflect.get(schema, "unevaluatedProperties");
  if (unevaluated === undefined) {
    return schema;
  }
  const { unevaluatedProperties: _, ...rest } = schema as JSONSchema7 & {
    unevaluatedProperties?: JSONSchema7Definition;
  };
  if (schema.additionalProperties !== undefined) {
    return rest;
  }
  if (hasBlockers(schema)) {
    return schema;
  }
  return {
    ...rest,
    additionalProperties: unevaluated as JSONSchema7Definition,
  };
}

function closesUnevaluated(schema: JSONSchema7): boolean {
  const unevaluated = Reflect.get(schema, "unevaluatedProperties") as
    | JSONSchema7Definition
    | undefined;
  return (
    unevaluated !== undefined &&
    schema.additionalProperties === undefined &&
    !isAllowAnySchema(unevaluated)
  );
}

function unmerged(left: JSONSchema7, right: JSONSchema7): JSONSchema7 {
  const {
    $defs: lDefs,
    definitions: lDefinitions,
    ...l
  } = left as JSONSchema7 & {
    $defs?: Record<string, JSONSchema7Definition>;
  };
  const {
    $defs: rDefs,
    definitions: rDefinitions,
    ...r
  } = right as JSONSchema7 & {
    $defs?: Record<string, JSONSchema7Definition>;
  };
  const result: JSONSchema7 & {
    $defs?: Record<string, JSONSchema7Definition>;
  } = {
    allOf: [l, r],
  };
  if (lDefs !== undefined || rDefs !== undefined) {
    result.$defs = { ...lDefs, ...rDefs };
  }
  if (lDefinitions !== undefined || rDefinitions !== undefined) {
    result.definitions = { ...lDefinitions, ...rDefinitions };
  }
  return result;
}

function createRewriteMerger() {
  // `keyed` records whether the merge is inside a keyed subschema, where
  // `false` is a valid schema.
  const keyed: boolean[] = [];
  function push(isKeyed: boolean) {
    keyed.push(isKeyed);
    return {
      [Symbol.dispose]() {
        keyed.pop();
      },
    };
  }
  function schemaDefinitionMerger(
    left: JSONSchema7Definition,
    right: JSONSchema7Definition
  ) {
    if (typeof left === "boolean" || typeof right === "boolean") {
      return merger.mergeSchemaDefinitions(left, right);
    }
    const l = rewriteUnevaluated(left);
    const r = rewriteUnevaluated(right);
    if (closesUnevaluated(l) || closesUnevaluated(r)) {
      return unmerged(l, r);
    }
    try {
      return merger.mergeSchemaDefinitions(l, r);
    } catch (error) {
      if (keyed.at(-1) ?? false) {
        return false;
      }
      throw error;
    }
  }
  const merger = createMerger({
    mergers: {
      $defs: (l, r) => {
        using _ = push(false);
        return merger.mergeRecordsOfSchemaDefinitions(l, r);
      },
      definitions: (l, r) => {
        using _ = push(false);
        return merger.mergeRecordsOfSchemaDefinitions(l, r);
      },
      anyOf: (l, r) => {
        using _ = push(false);
        return merger.mergeArraysOfSchemaDefinition(l, r);
      },
      oneOf: (l, r) => {
        using _ = push(false);
        return merger.mergeArraysOfSchemaDefinition(l, r);
      },
      propertyNames: (l, r) => {
        using _ = push(false);
        return schemaDefinitionMerger(l, r);
      },
      dependencies: (l, r) => {
        using _ = push(false);
        return merger.mergeDependencies(l, r);
      },
    },
    assigners: [
      [
        PROPERTIES_ASSIGNER_KEYS,
        (target, l, r) => {
          using _ = push(true);
          return merger.propertiesAssigner(target, l, r);
        },
      ],
      [
        ITEMS_ASSIGNER_KEYS,
        (target, l, r) => {
          using _ = push(true);
          return merger.itemsAssigner(target, l, r);
        },
      ],
    ],
    schemaDefinitionMerger,
  });
  return merger;
}

describe("schemaDefinitionMerger option", () => {
  it("returns the default internals for wrapping", () => {
    const merger = createMerger();
    expect(merger.mergeSchemaDefinitions).toBeTypeOf("function");
    expect(merger.mergeRecordsOfSchemaDefinitions).toBeTypeOf("function");
    expect(merger.mergeArraysOfSchemaDefinition).toBeTypeOf("function");
    expect(merger.mergeDependencies).toBeTypeOf("function");
    expect(merger.propertiesAssigner).toBeTypeOf("function");
    expect(merger.itemsAssigner).toBeTypeOf("function");
  });

  it("returns the default merger for delegation", () => {
    const { mergeSchemaDefinitions } = createMerger({
      schemaDefinitionMerger() {
        return false;
      },
    });
    expect(
      mergeSchemaDefinitions(
        { type: "string", minLength: 1 },
        { type: "string", maxLength: 5 }
      )
    ).toEqual({ type: "string", minLength: 1, maxLength: 5 });
  });

  it("can rewrite unevaluatedProperties as additionalProperties", () => {
    const { mergeArrayOfSchemaDefinitions } = createRewriteMerger();
    expect(
      mergeArrayOfSchemaDefinitions([
        { additionalProperties: true },
        {
          properties: { a: { type: "string" } },
          unevaluatedProperties: false,
        } as JSONSchema7,
      ])
    ).toEqual({
      properties: { a: { type: "string" } },
      additionalProperties: false,
    });
  });

  it("merges two unevaluatedProperties in either order", () => {
    const { mergeArrayOfSchemaDefinitions } = createRewriteMerger();
    const string = {
      unevaluatedProperties: { type: "string" },
    } as JSONSchema7;
    const none = { unevaluatedProperties: false } as JSONSchema7;
    expect(mergeArrayOfSchemaDefinitions([string, none])).toEqual({
      additionalProperties: false,
    });
    expect(mergeArrayOfSchemaDefinitions([none, string])).toEqual({
      additionalProperties: false,
    });
  });

  it("drops unevaluatedProperties when its own additionalProperties leaves nothing to see", () => {
    const { mergeArrayOfSchemaDefinitions } = createRewriteMerger();
    expect(
      mergeArrayOfSchemaDefinitions([
        {
          additionalProperties: true,
          unevaluatedProperties: false,
        } as JSONSchema7,
        { properties: { a: { type: "string" } } },
      ])
    ).toEqual({ properties: { a: { type: "string" } } });
  });

  it("keeps a closing pair unmerged and lifts definitions", () => {
    const { mergeArrayOfSchemaDefinitions } = createRewriteMerger();
    const opaque = {
      $ref: "#/$defs/b",
      unevaluatedProperties: false,
    } as JSONSchema7;
    expect(
      mergeArrayOfSchemaDefinitions([
        {
          $defs: { b: { properties: { b: {} } } },
          additionalProperties: { type: "string" },
        },
        opaque,
      ])
    ).toEqual({
      allOf: [{ additionalProperties: { type: "string" } }, opaque],
      $defs: { b: { properties: { b: {} } } },
    });
  });

  it("gives a subschema conflict false and still rejects a top-level conflict", () => {
    const { mergeArrayOfSchemaDefinitions } = createRewriteMerger();
    expect(
      mergeArrayOfSchemaDefinitions([
        { properties: { a: { type: "string" } } },
        { properties: { a: { type: "number" } } },
      ])
    ).toEqual({ properties: { a: false } });
    expect(() =>
      mergeArrayOfSchemaDefinitions([{ type: "string" }, { type: "number" }])
    ).toThrow(/incompatible types/);
  });
});
