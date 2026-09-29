---
"@x0k/json-schema-merge": patch
---

Merge the `properties`/`patternProperties`/`additionalProperties` and `items`/`additionalItems` keyword groups as a whole. When only one side had a keyword of a group, it was copied next to the other side's keywords of that group without going through the group's assigner, so `allOf: [{ properties: { a: {} } }, { additionalProperties: false }]` merged into a schema that allows `a`, which the original forbids. `additionalItems` next to a missing or schema-valued `items` is now dropped instead of being treated as `items: []`, which applied it to the other side's `items` or produced an invalid `items: []`.
