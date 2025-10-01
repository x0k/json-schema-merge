# JSON Schema merge

A minimal JSON Schema merging library.

```shell
npm i @x0k/json-schema-merge
```

**Goals**

- Fast and correct merging of JSON Schemas Draft-07
- Shallow merging of the `allOf` keyword

**Non-goals**

- Support for drafts other than Draft-07
- Deep merging of the `allOf` keyword (possible, but not optimal)
- Handling invalid or incorrect JSON Schemas (the merge result is undefined)
- Resolving `$ref` references (see [json-schema-ref-parser](https://github.com/APIDevTools/json-schema-ref-parser))

## Usage

```ts
import {
  createDeduplicator,
  createIntersector,
} from "@x0k/json-schema-merge/lib/array";
import {
  createMerger,
  createComparator,
  createShallowAllOfMerge,
} from "@x0k/json-schema-merge";

const { compareSchemaDefinitions, compareSchemaValues } = createComparator();

const { mergeArrayOfSchemaDefinitions } = createMerger({
  intersectJson: createIntersector(compareSchemaValues),
  deduplicateJsonSchemaDef: createDeduplicator(compareSchemaDefinitions),
});

const shallowAllOfMerge = createShallowAllOfMerge(
  mergeArrayOfSchemaDefinitions
);

const merged = shallowAllOfMerge({
  /* your schema with `allOf` keyword */
});
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
   * Fallback merger applied when no keyword-specific merger is defined.
   * @default identity
   */
  defaultMerger?: Merger<any>;

  /**
   * A mapping of schema keywords to merger functions.
   *
   * - A merger operates on **values of a single keyword** (`a`, `b` → merged value).
   */
  mergers?: Partial<{
    [K in SchemaKey]: Merger<Exclude<JSONSchema7[K], undefined>>;
  }>;

  /**
   * A collection of keyword groups with associated assigner functions.
   *
   * - An assigner operates at the **schema-object level** (`target`, `left`, `right`).
   */
  assigners?: Iterable<[SchemaKey[], Assigner<JSONSchema7>]>;
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

## License

MIT
