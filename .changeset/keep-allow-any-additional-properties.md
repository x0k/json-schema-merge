---
"@x0k/json-schema-merge": minor
---

Add the `assignSchemaDefinitionOrRecord` option to `createMerger` and export the default assigner. It lets consumers keep explicit allow-any values such as `additionalProperties: true` or `additionalProperties: {}` in the merged schema, including nested schemas and rebuilt `oneOf`/`anyOf` options (see [#21](https://github.com/x0k/json-schema-merge/issues/21)).
