---
"@x0k/json-schema-merge": patch
---

Keep `if`/`then`/`else` together when merging. `if`, `then` and `else` form one condition, so a keyword taken from one schema next to another schema's `if` binds the two together: `allOf: [{ if: false }, { if: true, else: false }]` merged into `{ if: false, else: false, allOf: [{ if: true, else: false }] }`, rejecting every instance instead of accepting every instance. When both schemas share at least one condition keyword, the right condition now moves to `allOf` whole and the left one stays at the root.

Fully disjoint conditions (left `if`/`then`, right only `else`) are still merged keyword by keyword; that behaviour is unchanged.
