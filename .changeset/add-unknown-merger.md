---
"@x0k/json-schema-merge": minor
---

Add the `unknownMerger` option to `createMerger`. It is used when no keyword-specific merger is registered and receives the schema key, including symbol keys. It defaults to `defaultMerger`, preserving existing behavior.
