# @x0k/json-schema-merge

## 1.1.0

### Minor Changes

- [#11](https://github.com/x0k/json-schema-merge/pull/11) [`b4e7250`](https://github.com/x0k/json-schema-merge/commit/b4e72509bfe288c0a07444301fe82f8e5fae0d90) Thanks [@MarekBodingerBA](https://github.com/MarekBodingerBA)! - Add the `isSchemaWithItems` type guard and the `SchemaWithItems` type.

### Patch Changes

- [#11](https://github.com/x0k/json-schema-merge/pull/11) [`0d470a3`](https://github.com/x0k/json-schema-merge/commit/0d470a3f0ad0ed13e2220e9aabe3b03f21328251) Thanks [@MarekBodingerBA](https://github.com/MarekBodingerBA)! - Merge keyword groups as a whole. `properties`/`patternProperties`/`additionalProperties`, `items`/`additionalItems` and `if`/`then`/`else` constrain each other, so `allOf: [{ properties: { a: {} } }, { additionalProperties: false }]` allowed `a`, and `allOf: [{ if: { minimum: 5 } }, { then: { maximum: 2 } }]` rejected everything from 5 up — a `then` without an `if` is inert. When the left side holds any keyword of a group, the right side's keywords of that group now go to the group's assigner: left at the root, right in `allOf`. `additionalItems` next to a missing or schema-valued `items` is dropped.

  > [!NOTE]
  > Custom `assigners` are now consulted per group, not per keyword: a keyword of your group that the left side lacks routes to your assigner instead of being copied to the root.

## 1.0.6

### Patch Changes

- [`3c173f7`](https://github.com/x0k/json-schema-merge/commit/3c173f7840c2756b8f5c16b4c30feab8f95ada93) Thanks [@x0k](https://github.com/x0k)! - Fix `contains` merging to follow JSON Schema semantics. `contains` is existential, so `allOf: [{ contains: A }, { contains: B }]` no longer collapses into a single `contains: A ∧ B` (which incorrectly required one array item to satisfy both). Distinct `contains` branches are now preserved like `if`/`then`/`else`: left stays at root, right moves to `allOf`. Trivial cases still collapse: identical branches deduplicate, `true`/`{}` yields the other side, `false` dominates.

  > [!NOTE]
  > Custom `mergers: { contains: ... }` no longer applies — `contains` is now handled by an assigner (like `if`/`then`/`else`, which also take precedence over `mergers`). Use a custom `assigners` entry to override `contains` merging.

## 1.0.5

### Patch Changes

- [#7](https://github.com/x0k/json-schema-merge/pull/7) [`75a99a7`](https://github.com/x0k/json-schema-merge/commit/75a99a72a34da8c09ca59b9a106a809fe9755bd3) Thanks [@jimmycallin](https://github.com/jimmycallin)! - Fix packaging: publish `src` so the shipped source maps and declaration maps resolve, and mark the package side-effect free for bundler tree-shaking.

## 1.0.4

### Patch Changes

- [`f506c46`](https://github.com/x0k/json-schema-merge/commit/f506c46694642d1550945b054b6abfb71d8235c4) Thanks [@x0k](https://github.com/x0k)! - Preserve symbol-keyed extension properties during schema merge

- [`1645dcf`](https://github.com/x0k/json-schema-merge/commit/1645dcf6cb66692917f72ba0ee5ed4abd504e728) Thanks [@x0k](https://github.com/x0k)! - Simplify output of `simplePatternsMerger`

## 1.0.3

### Patch Changes

- [`6ce4639`](https://github.com/x0k/json-schema-merge/commit/6ce4639990893b969dbda149a658941b12ff22d2) Thanks [@x0k](https://github.com/x0k)! - Filter out incompatible `oneOf/anyOf` combinations during schema merging instead of throwing an error; only throw if no valid combinations remain.

## 1.0.2

### Patch Changes

- [`20bceca`](https://github.com/x0k/json-schema-merge/commit/20bcecac745b2afae1bcd88e353f948a28d594ec) Thanks [@x0k](https://github.com/x0k)! - Enable source maps for better debugging

## 1.0.1

### Patch Changes

- [`c4c7408`](https://github.com/x0k/json-schema-merge/commit/c4c74087b48de6166b47a626187b533b164714d4) Thanks [@x0k](https://github.com/x0k)! - Add type declarations to `package.json` exports

## 1.0.0

### Major Changes

- [`ef13fee`](https://github.com/x0k/json-schema-merge/commit/ef13fee04730c43ad74db77a24a00691f53adb2e) Thanks [@x0k](https://github.com/x0k)! - Initial release of json-schema-merge
