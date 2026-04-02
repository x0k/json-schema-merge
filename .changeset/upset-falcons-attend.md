---
"@x0k/json-schema-merge": patch
---

Filter out incompatible `oneOf/anyOf` combinations during schema merging instead of throwing an error; only throw if no valid combinations remain.
