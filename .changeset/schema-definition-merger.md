---
"@x0k/json-schema-merge": minor
---

Add the `schemaDefinitionMerger` option to `createMerger`. It replaces the default merge of two schema definitions, including `false` and allow-any schemas, and nested merges call it again. The `mergeSchemaDefinitions` function returned by `createMerger` performs the default merge, so a custom merger can delegate to it. `createMerger` also returns its default helpers (`mergeRecordsOfSchemaDefinitions`, `mergeArraysOfSchemaDefinition`, `mergeDependencies`, `propertiesAssigner`, and `itemsAssigner`) so they can be wrapped and passed back through `mergers` and `assigners`; `PROPERTIES_ASSIGNER_KEYS` and `ITEMS_ASSIGNER_KEYS` are exported for the corresponding keyword groups.
