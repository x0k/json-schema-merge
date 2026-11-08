import { merge as allOfMerge } from "allof-merge";
import type { JSONSchema7, JSONSchema7Definition } from "json-schema";
import jsonSchemaMergeAllOf, { type Options } from "json-schema-merge-allof";
import { describe, test } from "vitest";

import { createDeduplicator, createIntersector } from "../../array.ts";
import { createComparator } from "../compare/index.ts";
import {
  createDeepAllOfMerge,
  createShallowAllOfMerge,
} from "./all-of-merge.ts";
import testData from "./fixtures/data.json" with { type: "json" };
import userSchema from "./fixtures/user-schema.json" with { type: "json" };
import { createMerger } from "./merge.ts";

const { compareSchemaValues, compareSchemaDefinitions } = createComparator();

function supports(fn: () => unknown) {
  try {
    fn();
    return true;
  } catch {
    return false;
  }
}

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
    test(name, async ({ bench }) => {
      const mergeAllOf = () =>
        jsonSchemaMergeAllOf(
          data as JSONSchema7,
          {
            deep: false,
          } as Options
        );

      await bench.compare(
        bench("shallowAllOfMerge", () => {
          shallowAllOfMerge(data as JSONSchema7Definition);
        }),
        ...(supports(mergeAllOf)
          ? [bench("json-schema-merge-allof", mergeAllOf)]
          : []),
        // NOTE: Performs deep merge by default; comparison may be incorrect.
        bench("allof-merge", () => {
          allOfMerge(data);
        })
      );
    });
  }
});

describe("huge shallow merge", () => {
  test("huge shallow merge", async ({ bench }) => {
    const mergeAllOf = () =>
      jsonSchemaMergeAllOf(userSchema as unknown as JSONSchema7);

    await bench.compare(
      bench("shallowAllOfMerge", () => {
        shallowAllOfMerge(userSchema as unknown as JSONSchema7);
      }),
      ...(supports(mergeAllOf)
        ? [bench("json-schema-merge-allof", mergeAllOf)]
        : []),
      bench("allof-merge", () => {
        allOfMerge(userSchema);
      })
    );
  });
});

describe("deep merge", () => {
  test("deep merge", async ({ bench }) => {
    const mergeAllOf = () =>
      jsonSchemaMergeAllOf(testData as unknown as JSONSchema7);

    await bench.compare(
      bench("deepAllOfMerge", () => {
        deepAllOfMerge(testData as unknown as JSONSchema7);
      }),
      ...(supports(mergeAllOf)
        ? [bench("json-schema-merge-allof", mergeAllOf)]
        : []),
      bench("allof-merge", () => {
        allOfMerge(testData);
      })
    );
  });
});
