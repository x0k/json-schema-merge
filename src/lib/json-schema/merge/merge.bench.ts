import { bench, describe } from "vitest";
import type { JSONSchema7, JSONSchema7Definition } from "json-schema";
import jsonSchemaMergeAllOf, { type Options } from "json-schema-merge-allof";
import { merge as allOfMerge } from "allof-merge";

import { createDeduplicator, createIntersector } from "../../array.ts";

import { createComparator } from "../compare/index.ts";

import testData from "./fixtures/data.json" with { type: "json" };
import userSchema from "./fixtures/user-schema.json" with { type: "json" };
import { createMerger } from "./merge.ts";
import {
  createDeepAllOfMerge,
  createShallowAllOfMerge,
} from "./all-of-merge.ts";

const { compareSchemaValues, compareSchemaDefinitions } = createComparator();

const { mergeArrayOfSchemaDefinitions } = createMerger({
  intersectJson: createIntersector(compareSchemaValues),
  deduplicateJsonSchemaDef: createDeduplicator(compareSchemaDefinitions),
});
const shallowAllOfMerge = createShallowAllOfMerge(
  mergeArrayOfSchemaDefinitions
);

const {
  mergeArrayOfSchemaDefinitions: mergeArrayOfSchemaDefinitionsWithoutChecks,
} = createMerger({
  intersectJson: createIntersector(compareSchemaValues),
  deduplicateJsonSchemaDef: createDeduplicator(compareSchemaDefinitions),
  // NOTE: We disable checks in order to get at least some result, otherwise there will be an error.
  checks: [],
});
const shallowAllOfMergeWithoutChecks = createShallowAllOfMerge(
  mergeArrayOfSchemaDefinitionsWithoutChecks
);
const deepAllOfMerge = createDeepAllOfMerge(shallowAllOfMergeWithoutChecks);

describe("shallow merge", () => {
  for (const [name, data] of Object.entries(testData.properties)) {
    describe(name, () => {
      bench("shallowAllOfMerge", () => {
        shallowAllOfMerge(data as JSONSchema7Definition);
      });
      bench("json-schema-merge-allof", () => {
        jsonSchemaMergeAllOf(data as JSONSchema7, { deep: false } as Options);
      });
      // NOTE: Performs deep merge by default; comparison may be incorrect.
      bench("allof-merge", () => {
        allOfMerge(data);
      });
    });
  }
});

describe("huge shallow merge", () => {
  bench("shallowAllOfMerge", () => {
    shallowAllOfMerge(userSchema as unknown as JSONSchema7);
  });
  bench("json-schema-merge-allof", () => {
    jsonSchemaMergeAllOf(userSchema as unknown as JSONSchema7);
  });
  bench("allof-merge", () => {
    allOfMerge(userSchema);
  });
});

describe("deep merge", () => {
  bench("deepAllOfMerge", () => {
    deepAllOfMerge(testData as unknown as JSONSchema7);
  });
  bench("json-schema-merge-allof", () => {
    jsonSchemaMergeAllOf(testData as unknown as JSONSchema7);
  });
  bench("allof-merge", () => {
    allOfMerge(testData);
  });
});
