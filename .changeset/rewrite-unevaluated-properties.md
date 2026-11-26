---
"@x0k/json-schema-merge": minor
---

Add the `rewriteUnevaluatedProperties` option to `createMerger` and `createShallowAllOfMerge`. It merges `unevaluatedProperties` by the keys it sees: one beside no in-place applicator is merged as the `additionalProperties` it equals, a pair it can't be rewritten in is kept unmerged in an `allOf`, a key or item subschema no value can meet becomes `false`, and the schema's own `unevaluatedProperties` applies to the merge of its `allOf`. Merged results then accept the same data as the `allOf`, and keeping an explicit `additionalProperties: true` is safe (see [#24](https://github.com/x0k/json-schema-merge/issues/24)). It defaults to `false`, preserving existing behavior.
