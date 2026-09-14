---
"@x0k/json-schema-merge": patch
---

Fix `contains` merging to follow JSON Schema semantics. `contains` is existential, so `allOf: [{ contains: A }, { contains: B }]` no longer collapses into a single `contains: A ∧ B` (which incorrectly required one array item to satisfy both). Distinct `contains` branches are now preserved like `if`/`then`/`else`: left stays at root, right moves to `allOf`. Trivial cases still collapse: identical branches deduplicate, `true`/`{}` yields the other side, `false` dominates.

> [!NOTE]
> Custom `mergers: { contains: ... }` no longer applies — `contains` is now handled by an assigner (like `if`/`then`/`else`, which also take precedence over `mergers`). Use a custom `assigners` entry to override `contains` merging.
