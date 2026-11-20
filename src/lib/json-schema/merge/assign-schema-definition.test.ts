import type { JSONSchema7Definition } from "json-schema";
import { describe, expect, it } from "vitest";

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
  if (key === "additionalProperties" || key === "additionalItems") {
    if (value === undefined) {
      delete target[key];
    } else {
      target[key] = value;
    }
    return;
  }
  assignSchemaDefinitionOrRecord(target, key, value);
};

const { mergeArrayOfSchemaDefinitions, mergeSchemaDefinitions } = createMerger({
  assignSchemaDefinitionOrRecord: keepAllowAnyAdditionalAssigner,
});

describe("assignSchemaDefinitionOrRecord option", () => {
  it("keeps an explicit additionalProperties: true beside another schema", () => {
    expect(
      mergeArrayOfSchemaDefinitions([
        { type: "object", additionalProperties: true },
        { properties: { a: { type: "string" } } },
      ])
    ).toEqual({
      type: "object",
      additionalProperties: true,
      properties: { a: { type: "string" } },
    });
  });

  it("keeps an explicit additionalProperties: {} beside another schema", () => {
    expect(
      mergeArrayOfSchemaDefinitions([
        { type: "object", additionalProperties: {} },
        { properties: { a: { type: "string" } } },
      ])
    ).toEqual({
      type: "object",
      additionalProperties: {},
      properties: { a: { type: "string" } },
    });
  });

  it("keeps additionalProperties: true when both sides allow any value", () => {
    expect(
      mergeArrayOfSchemaDefinitions([
        { type: "object", additionalProperties: true },
        { additionalProperties: true },
      ])
    ).toEqual({
      type: "object",
      additionalProperties: true,
    });
  });

  it("keeps additionalProperties inside merged oneOf options", () => {
    expect(
      mergeArrayOfSchemaDefinitions([
        {
          oneOf: [
            { properties: { a: { type: "number" } } },
            {
              properties: { b: { type: "number" } },
              additionalProperties: true,
            },
          ],
        },
        { oneOf: [{ properties: { c: { type: "string" } } }] },
      ])
    ).toEqual({
      oneOf: [
        { properties: { a: { type: "number" }, c: { type: "string" } } },
        {
          properties: { b: { type: "number" }, c: { type: "string" } },
          additionalProperties: true,
        },
      ],
    });
  });

  it("keeps additionalProperties in nested properties", () => {
    expect(
      mergeArrayOfSchemaDefinitions([
        {
          properties: {
            p: { type: "object", additionalProperties: true },
          },
        },
        {
          properties: { p: { properties: { q: { type: "string" } } } },
        },
      ])
    ).toEqual({
      properties: {
        p: {
          type: "object",
          additionalProperties: true,
          properties: { q: { type: "string" } },
        },
      },
    });
  });

  it("keeps an explicit additionalItems: true next to a tuple", () => {
    const left: JSONSchema7Definition = {
      items: [{}],
      additionalItems: true,
    };
    const right: JSONSchema7Definition = { items: [{}] };

    expect(mergeSchemaDefinitions(left, right)).toEqual({
      items: [true],
      additionalItems: true,
    });
  });

  it("still drops allow-any values by default", () => {
    const { mergeArrayOfSchemaDefinitions } = createMerger();

    expect(
      mergeArrayOfSchemaDefinitions([
        { type: "object", additionalProperties: true },
        { properties: { a: { type: "string" } } },
      ])
    ).toEqual({
      type: "object",
      properties: { a: { type: "string" } },
    });
  });
});
