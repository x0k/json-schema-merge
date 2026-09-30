---
"@x0k/json-schema-merge": patch
---

Merge keyword groups as a whole. `properties`/`patternProperties`/`additionalProperties`, `items`/`additionalItems` and `if`/`then`/`else` constrain each other, so `allOf: [{ properties: { a: {} } }, { additionalProperties: false }]` allowed `a`, and `allOf: [{ if: { minimum: 5 } }, { then: { maximum: 2 } }]` rejected everything from 5 up — a `then` without an `if` is inert. When the left side holds any keyword of a group, the right side's keywords of that group now go to the group's assigner: left at the root, right in `allOf`. `additionalItems` next to a missing or schema-valued `items` is dropped.

> [!NOTE]
> Custom `assigners` are now consulted per group, not per keyword: a keyword of your group that the left side lacks routes to your assigner instead of being copied to the root.
