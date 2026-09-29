---
"@x0k/json-schema-merge": patch
---

Keep `if`/`then`/`else` together when merging. When the left schema had an incomplete condition (e.g. `if` + `then` without `else`) and the right schema had the missing keyword, that keyword was copied next to the left `if` before the condition assigner ran, so `allOf: [{ if: false }, { if: true, else: false }]` merged into `{ if: false, else: false, allOf: [{ if: true, else: false }] }`, which rejects every instance instead of accepting every instance. Once the left schema has any of `if`/`then`/`else`, all condition keywords of the right schema now go to the condition assigner: left stays at root, right moves to `allOf` as a whole.
