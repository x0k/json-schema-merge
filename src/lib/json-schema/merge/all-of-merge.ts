import type { JSONSchema7, JSONSchema7Definition } from "json-schema";

import { transformSchemaDefinition } from "../transform.ts";

function getAllOfSchemas(
  schema: JSONSchema7Definition
): JSONSchema7Definition[] {
  const result: JSONSchema7Definition[] = [];
  const stack: JSONSchema7Definition[] = [schema];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (typeof current === "boolean" || current.allOf === undefined) {
      result.push(current);
      continue;
    }
    const { allOf, ...rest } = current;
    result.push(rest);
    for (let i = allOf.length - 1; i >= 0; i--) {
      stack.push(allOf[i]!);
    }
  }
  return result;
}

export interface ShallowAllOfMergeOptions {
  /**
   * Pair with the merger's `rewriteUnevaluatedProperties`: apply the schema's
   * own `unevaluatedProperties` to the merge of its `allOf` rather than merging
   * it with the entries, since it sees the keys they evaluate.
   *
   * @default false
   */
  rewriteUnevaluatedProperties?: boolean;
}

export function createShallowAllOfMerge(
  mergeArrayOfSchemaDefinitions: (
    defs: JSONSchema7Definition[]
  ) => JSONSchema7Definition,
  { rewriteUnevaluatedProperties = false }: ShallowAllOfMergeOptions = {}
) {
  if (!rewriteUnevaluatedProperties) {
    return (schema: JSONSchema7Definition) =>
      mergeArrayOfSchemaDefinitions(getAllOfSchemas(schema));
  }
  return (schema: JSONSchema7Definition) => {
    const unevaluated =
      typeof schema === "boolean" || schema.allOf === undefined
        ? undefined
        : (Reflect.get(schema, "unevaluatedProperties") as
            | JSONSchema7Definition
            | undefined);
    if (unevaluated === undefined) {
      return mergeArrayOfSchemaDefinitions(getAllOfSchemas(schema));
    }
    const { unevaluatedProperties: _, ...rest } = schema as JSONSchema7 & {
      unevaluatedProperties?: JSONSchema7Definition;
    };
    const schemas = getAllOfSchemas(rest);
    const merged = mergeArrayOfSchemaDefinitions(schemas);
    // An `additionalProperties` or `unevaluatedProperties` of the schema or an
    // entry marks every key it reaches as seen, leaving this one nothing
    const seesNothing = schemas.some(
      (entry) =>
        typeof entry !== "boolean" &&
        (entry.additionalProperties !== undefined ||
          Reflect.get(entry, "unevaluatedProperties") !== undefined)
    );
    return seesNothing || typeof merged === "boolean"
      ? merged
      : ({ ...merged, unevaluatedProperties: unevaluated } as JSONSchema7);
  };
}

export function createDeepAllOfMerge(
  shallowMerge: (def: JSONSchema7Definition) => JSONSchema7Definition
) {
  return (schemaDef: JSONSchema7Definition) =>
    transformSchemaDefinition<JSONSchema7Definition>(schemaDef, (def) => {
      if (typeof def === "boolean" || def.allOf === undefined) {
        return def;
      }
      return shallowMerge(def);
    });
}
