---
"@x0k/json-schema-merge": patch
---

Fix merging schema-valued `items` with array-valued `items`. The single schema applies to every element, so when the tuple side has no `additionalItems`, it is now preserved as the merged `additionalItems` instead of being dropped.
