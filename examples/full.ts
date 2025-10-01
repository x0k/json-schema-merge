import { deepEqual } from "node:assert/strict";
import type { JSONSchema7 } from "json-schema";

import { createDeduplicator, createIntersector } from "../src/lib/array.ts";
import {
  createMerger,
  createComparator,
  createShallowAllOfMerge,
} from "../src/index.ts";

const { compareSchemaDefinitions, compareSchemaValues } = createComparator();

const { mergeArrayOfSchemaDefinitions } = createMerger({
  intersectJson: createIntersector(compareSchemaValues),
  deduplicateJsonSchemaDef: createDeduplicator(compareSchemaDefinitions),
});

const shallowAllOfMerge = createShallowAllOfMerge(
  mergeArrayOfSchemaDefinitions
);

const enumValues = ["foo", { bar: "baz" }];

const schema: JSONSchema7 = {
  enum: enumValues.concat(enumValues),
};

const schemas: JSONSchema7[] = [schema, schema];

const oneOfSchema: JSONSchema7 = {
  oneOf: schemas,
};

deepEqual(
  shallowAllOfMerge(
    structuredClone({
      allOf: [oneOfSchema, oneOfSchema],
    })
  ),
  {
    oneOf: [{ enum: enumValues }],
  }
);
