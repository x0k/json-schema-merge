# json-schema-merge

A library for merging **JSON Schema Draft-07** definitions with no runtime dependencies.

```shell
npm i @x0k/json-schema-merge
```

**Features**:

- Ordering comparison for JSON values
- Ordering comparison for JSON Schemas
- JSON Schema merging
- Shallow merging of the `allOf` keyword in JSON Schemas
- Deep merging of the `allOf` keyword in JSON Schemas

**Goals**

- Fast and correct merging of JSON Schemas Draft-07
- Shallow merging of the `allOf` keyword

**Non-goals**

- Support for drafts other than Draft-07
- Handling invalid or incorrect JSON Schemas (the merge result is undefined)
- Resolving `$ref` references (see [json-schema-ref-parser](https://github.com/APIDevTools/json-schema-ref-parser))

## Usage

```ts
import {
  createMerger,
  createComparator,
  createShallowAllOfMerge,
  // Use to merge nested `allOf`
  createDeepAllOfMerge,
} from "@x0k/json-schema-merge";
import {
  createDeduplicator,
  createIntersector,
} from "@x0k/json-schema-merge/lib/array";

const { compareSchemaDefinitions, compareSchemaValues } = createComparator();

const {
  mergeArrayOfSchemaDefinitions,
  // Use to merge two `JSONSchema7Definition`
  mergeSchemaDefinitions,
} = createMerger({
  intersectJson: createIntersector(compareSchemaValues),
  deduplicateJsonSchemaDef: createDeduplicator(compareSchemaDefinitions),
});

const shallowAllOfMerge = createShallowAllOfMerge(
  mergeArrayOfSchemaDefinitions
);

const merged = shallowAllOfMerge({/* your schema with `allOf` keyword */});
```

### Options

```ts
/**
 * Function type for removing duplicates from an array.
 * Should return a new array with unique elements only.
 */
export type Deduplicator<T> = (data: T[]) => T[];

/**
 * Function type for intersecting two arrays of the same type.
 */
export type Intersector<T> = (a: T[], b: T[]) => T[];

/**
 * A merger function combines two values for a specific JSON Schema keyword.
 */
export type Merger<T> = (a: T, b: T) => T;

/**
 * A merger applied when no keyword-specific merger is registered.
 *
 * The schema key is provided so the merger can handle unknown or custom
 * keywords differently. It may be a symbol.
 */
export type UnknownMerger = (
  a: unknown,
  b: unknown,
  key: string | symbol
) => unknown;

/**
 * An assigner function operates at the schema-object level.
 * It receives the partially merged `target` and the original
 * `left` and `right` schemas.
 *
 * In most cases, it modifies and returns the `target` object,
 * but it may also return a completely new schema object if needed.
 *
 * Assigners are used for keywords that cannot be merged by simple
 * value-level functions, often because they interact with other
 * keywords or require holistic decisions.
 */
export type Assigner<R extends {}> = (target: R, l: R, r: R) => R;

/**
 * A validation function that ensures consistency between two schema keywords.
 */
export type Check<K extends SchemaKey> = (
  target: Required<Pick<JSONSchema7, K>>
) => boolean;

export type CheckEntry<A extends SchemaKey, B extends SchemaKey> = readonly [
  A,
  B,
  Check<A | B>,
];

export interface MergeOptions {
  /**
   * Custom function to test whether a regular expression `subExpr`
   * is considered a subset of another `superExpr`.
   * @default Object.is
   */
  isSubRegExp?: (subExpr: string, superExpr: string) => boolean;

  /**
   * Merger function for combining regular expression patterns
   * @default simplePatternsMerger
   */
  mergePatterns?: Merger<string>;

  /**
   * Intersector function for merging JSON values (enum keyword)
   * @default intersection
   */
  intersectJson?: Intersector<JSONSchema7Type>;

  /**
   * Deduplication strategy for JSON Schema definitions.
   * @default identity
   */
  deduplicateJsonSchemaDef?: Deduplicator<JSONSchema7Definition>;

  /**
   * Default value-level merger for keywords that preserve a single value
   * (for example `$id`, `description`, and `title`), and the default for
   * `unknownMerger`.
   * @default identity
   */
  defaultMerger?: Merger<any>;

  /**
   * Merger applied when no keyword-specific merger is registered.
   * Receives the schema key, including symbol keys.
   * @default defaultMerger
   */
  unknownMerger?: UnknownMerger;

  /**
   * Merger for pairs of schema definitions, including `false` and allow-any
   * schemas (`true` or `{}`).
   *
   * It replaces the default merge at every level, so nested merges call it
   * again. The `mergeSchemaDefinitions` function returned by `createMerger`
   * performs the default merge and can be used for delegation.
   *
   * @default defaultMergeSchemaDefinitions
   */
  schemaDefinitionMerger?: Merger<JSONSchema7Definition>;

  /**
   * Assigner for schema definition or record keywords
   * (`additionalProperties`, `additionalItems`, `properties`,
   * `patternProperties`).
   *
   * The default implementation removes `undefined` and allow-any values
   * (`true` or `{}`). Override it to keep explicit values such as
   * `additionalProperties: true` or `additionalProperties: {}`.
   *
   * @default assignSchemaDefinitionOrRecord
   */
  assignSchemaDefinitionOrRecord?: SchemaDefinitionOrRecordAssigner;

  /**
   * A mapping of schema keywords to merger functions.
   *
   * - A merger operates on **values of a single keyword** (`a`, `b` → merged value).
   * - When provided, a custom merger **overrides the default merger** for that keyword.
   */
  mergers?: Partial<{
    [K in SchemaKey]: Merger<Exclude<JSONSchema7[K], undefined>>;
  }>;

  /**
   * A collection of keyword groups with associated assigner functions.
   *
   * - An assigner operates at the **schema-object level** (`target`, `left`, `right`).
   * - Custom assigners are **appended** to the default assigners,
   *   but can also **replace behavior** for specific keywords if they overlap.
   */
  assigners?: Iterable<[SchemaKey[], Assigner<JSONSchema7>]>;

  /**
   * Consistency checks to validate relationships between
   * pairs of schema keywords (e.g. `minimum` ≤ `maximum`).
   *
   * - A check ensures that two related keywords do not conflict.
   * - Providing this option **replaces the default checks** completely.
   *
   * @default DEFAULT_CHECKS
   */
  checks?: Iterable<CheckEntry<SchemaKey, SchemaKey>>;
}
```

## Compatibility

This library was originally developed as part of the [svelte-jsonschema-form](https://github.com/x0k/svelte-jsonschema-form) project to replace [json-schema-merge-allof](https://github.com/mokkabonna/json-schema-merge-allof) and [json-schema-compare](https://github.com/mokkabonna/json-schema-compare).

It can be used as a drop-in alternative with the following differences:

### Compared to `json-schema-compare`

- See the usage of the `DOES_NOT_MATCH` constant in the [comparison test](./src/lib/json-schema/compare/compare.test.ts)

### Compared to `json-schema-merge-allof`

- Uses a different algorithm for sorting JSON values — order in array-like structures may differ
- More precise merging of the `properties`, `patternProperties`, and `additionalProperties` keywords
- Support for merging `number` and `integer` types
- Support for merging `if`, `then` and `else` keywords
- Fixed merging of regular expressions (see [comparison test](./src/lib/json-schema/merge/patterns.test.ts))
- Built-in schema consistency checks (e.g. `minimum` ≤ `maximum`)

## License

MIT
