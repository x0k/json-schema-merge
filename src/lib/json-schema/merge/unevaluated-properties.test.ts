import { Ajv2020 } from "ajv/dist/2020.js";
import type { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { describe, expect, it } from "vitest";

import {
  createDeepAllOfMerge,
  createShallowAllOfMerge,
} from "./all-of-merge.ts";
import {
  assignSchemaDefinitionOrRecord,
  createMerger,
  type SchemaDefinitionOrRecordAssigner,
} from "./merge.ts";

const keepAllowAnyAdditionalAssigner: SchemaDefinitionOrRecordAssigner = (
  target,
  key,
  value
) => {
  if (key === "additionalProperties" && value !== undefined) {
    target[key] = value;
    return;
  }
  assignSchemaDefinitionOrRecord(target, key, value);
};

const { mergeArrayOfSchemaDefinitions } = createMerger({
  rewriteUnevaluatedProperties: true,
});
const shallowAllOfMerge = createShallowAllOfMerge(
  mergeArrayOfSchemaDefinitions,
  { rewriteUnevaluatedProperties: true }
);

const a: JSONSchema7 = { type: "string" };
const closed = {
  properties: { a },
  unevaluatedProperties: false,
} as JSONSchema7;

describe("rewriteUnevaluatedProperties option", () => {
  it("merges an unevaluatedProperties beside no in-place applicator as the additionalProperties it equals", () => {
    expect(
      mergeArrayOfSchemaDefinitions([{ additionalProperties: true }, closed])
    ).toEqual({ properties: { a }, additionalProperties: false });
  });

  it("merges two unevaluatedProperties the same in either order", () => {
    const string = { unevaluatedProperties: { type: "string" } } as JSONSchema7;
    const none = { unevaluatedProperties: false } as JSONSchema7;
    expect(mergeArrayOfSchemaDefinitions([string, none])).toEqual({
      additionalProperties: false,
    });
    expect(mergeArrayOfSchemaDefinitions([none, string])).toEqual({
      additionalProperties: false,
    });
  });

  it("drops an unevaluatedProperties its own additionalProperties leaves nothing to see", () => {
    expect(
      mergeArrayOfSchemaDefinitions([
        {
          additionalProperties: true,
          unevaluatedProperties: false,
        } as JSONSchema7,
        { properties: { a } },
      ])
    ).toEqual({ properties: { a } });
  });

  it("keeps a pair unmerged where an unevaluatedProperties beside an in-place applicator closes, lifting definitions", () => {
    const opaque = {
      $ref: "#/$defs/b",
      unevaluatedProperties: false,
    } as JSONSchema7;
    expect(
      mergeArrayOfSchemaDefinitions([
        { $defs: { b: { properties: { b: {} } } }, additionalProperties: a },
        opaque,
      ] as JSONSchema7[])
    ).toEqual({
      allOf: [{ additionalProperties: a }, opaque],
      $defs: { b: { properties: { b: {} } } },
    });
  });

  it("applies the schema's own unevaluatedProperties to the merge of its allOf", () => {
    expect(
      shallowAllOfMerge({
        unevaluatedProperties: false,
        allOf: [{ properties: { a } }, { properties: { b: a } }],
      } as JSONSchema7)
    ).toEqual({ properties: { a, b: a }, unevaluatedProperties: false });
  });

  it("drops the schema's own unevaluatedProperties where an entry's additionalProperties leaves it nothing to see", () => {
    expect(
      shallowAllOfMerge({
        unevaluatedProperties: false,
        allOf: [{ additionalProperties: true }, { properties: { a } }],
      } as JSONSchema7)
    ).toEqual({ properties: { a } });
  });

  it("gives a key no value can meet false, and still rejects an impossible schema", () => {
    expect(
      mergeArrayOfSchemaDefinitions([
        { properties: { a } },
        { properties: { a: { type: "number" } } },
      ])
    ).toEqual({ properties: { a: false } });
    expect(() =>
      mergeArrayOfSchemaDefinitions([{ type: "string" }, { type: "number" }])
    ).toThrow(/incompatible types/);
  });

  it("leaves the merge as it was when off", () => {
    const off = createMerger().mergeArrayOfSchemaDefinitions;
    expect(off([{ additionalProperties: true }, closed])).toEqual(closed);
  });
});

const S: JSONSchema7 = { type: "string" };
const ENTRIES = [
  {},
  { additionalProperties: true },
  { additionalProperties: {} },
  { additionalProperties: false },
  { additionalProperties: S },
  { unevaluatedProperties: false },
  { unevaluatedProperties: S },
  { unevaluatedProperties: true },
  { properties: { a: {} } },
  { properties: { a: {} }, unevaluatedProperties: false },
  { properties: { a: {} }, unevaluatedProperties: S },
  {
    properties: { a: {} },
    additionalProperties: true,
    unevaluatedProperties: false,
  },
  { patternProperties: { "^b": {} }, unevaluatedProperties: false },
  {
    properties: { a: {} },
    anyOf: [{ properties: { b: {} } }, { required: ["a"] }],
    unevaluatedProperties: false,
  },
  {
    if: { required: ["a"] },
    then: { properties: { b: {} } },
    unevaluatedProperties: false,
  },
  {
    properties: { a: {} },
    allOf: [{ properties: { b: {} } }],
    unevaluatedProperties: false,
  },
  {
    dependentSchemas: { a: { properties: { b: {} } } },
    unevaluatedProperties: false,
  },
  { $ref: "#/$defs/b", unevaluatedProperties: false },
  { not: { required: ["z"] }, unevaluatedProperties: false },
  { propertyNames: { maxLength: 1 }, unevaluatedProperties: false },
  { properties: { a: S }, required: ["a"] },
  { patternProperties: { "^b": { type: "number" } } },
  { additionalProperties: true, properties: { a: {} } },
  { unevaluatedProperties: false, additionalProperties: S },
  { properties: { b: {} }, unevaluatedProperties: { type: "number" } },
] as JSONSchema7[];
const ROOTS = [
  {},
  { unevaluatedProperties: false },
  { properties: { c: {} } },
  { additionalProperties: true },
] as JSONSchema7[];
const DATA: Record<string, unknown>[] = [
  {},
  { a: "x" },
  { b: "x" },
  { c: "x" },
  { z: "x" },
  { a: 1 },
  { b: 1 },
  { z: 1 },
  { a: "x", b: "x" },
  { a: "x", z: "x" },
  { b: "x", bb: "x" },
  { a: "x", b: "x", c: "x", z: "x", bb: 1 },
];
const DEFS = { $defs: { b: { properties: { b: {} } } } };

/** Every ordered pair of entries, at the top under each root, under a property and under a pattern, with its data */
function cases(): [JSONSchema7, unknown[]][] {
  const result: [JSONSchema7, unknown[]][] = [];
  const nested = DATA.map((data) => ({ p: data }));
  for (const left of ENTRIES) {
    for (const right of ENTRIES) {
      for (const root of ROOTS) {
        result.push([
          { type: "object", ...DEFS, ...root, allOf: [left, right] },
          DATA,
        ]);
      }
      result.push([
        {
          type: "object",
          ...DEFS,
          allOf: [{ properties: { p: left } }, { properties: { p: right } }],
        },
        nested,
      ]);
      result.push([
        {
          type: "object",
          ...DEFS,
          allOf: [
            { patternProperties: { "^p": left } },
            { patternProperties: { "^p": right } },
          ],
        },
        nested,
      ]);
    }
  }
  return result;
}

describe("rewriteUnevaluatedProperties against a validator", () => {
  const ajv = new Ajv2020({ strict: false, addUsedSchema: false });
  const compiled = new Map<string, (data: unknown) => boolean>();
  const validate = (schema: JSONSchema7Definition, data: unknown) => {
    const key = JSON.stringify(schema);
    let fn = compiled.get(key);
    if (fn === undefined) {
      fn = ajv.compile(schema);
      compiled.set(key, fn);
    }
    return fn(data);
  };

  it.each([
    ["the default assigner", assignSchemaDefinitionOrRecord],
    [
      "an assigner keeping additionalProperties: true",
      keepAllowAnyAdditionalAssigner,
    ],
  ])(
    "merges each allOf to a schema accepting the same data, with %s",
    (_, assigner) => {
      const deepAllOfMerge = createDeepAllOfMerge(
        createShallowAllOfMerge(
          createMerger({
            rewriteUnevaluatedProperties: true,
            assignSchemaDefinitionOrRecord: assigner,
          }).mergeArrayOfSchemaDefinitions,
          { rewriteUnevaluatedProperties: true }
        )
      );
      const mismatches: string[] = [];
      for (const [schema, data] of cases()) {
        const merged = deepAllOfMerge(structuredClone(schema));
        for (const value of data) {
          if (validate(merged, value) !== validate(schema, value)) {
            mismatches.push(
              `${JSON.stringify(schema)} with ${JSON.stringify(value)}`
            );
          }
        }
      }
      expect(mismatches).toEqual([]);
    }
  );
});
