---
"@x0k/json-schema-merge": patch
---

Fix `additionalProperties` leaking into `patternProperties` from another branch. Properties explicitly declared on the opposite side, as well as names covered by its `patternProperties`, no longer receive that side's `additionalProperties` constraints.
