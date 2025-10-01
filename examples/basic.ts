import { deepEqual } from "node:assert/strict";

import { createMerger, createShallowAllOfMerge } from "../src/index.ts";

const { mergeArrayOfSchemaDefinitions } = createMerger();
const shallowAllOfMerge = createShallowAllOfMerge(
  mergeArrayOfSchemaDefinitions
);

deepEqual(
  shallowAllOfMerge({
    allOf: [
      {
        type: "string",
        minLength: 1,
      },
      {
        type: "string",
        maxLength: 5,
      },
    ],
  }),
  {
    type: "string",
    minLength: 1,
    maxLength: 5,
  }
);
