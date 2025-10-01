import type {
  JSONSchema7 as Schema,
  JSONSchema7Definition as SchemaDefinition,
} from "json-schema";

import type { Visitor } from "../traverser.ts";

import type {
  AnySubSchemaKey,
  SubSchemaKey,
  SubSchemasArrayKey,
  SubSchemasRecordKey,
} from "./json-schema.ts";

export type SchemaTraverserContextType = "array" | "record" | "sub" | "root";

export interface AbstractSchemaTraverserContext<
  T extends SchemaTraverserContextType,
  K extends AnySubSchemaKey
> {
  type: T;
  path: SubSchemasArrayKey extends K ? Array<string | number> : string[];
}

export interface ArraySchemaTraverserContext<K extends AnySubSchemaKey>
  extends AbstractSchemaTraverserContext<"array", K> {
  parent: Schema;
  key: SubSchemasArrayKey & K;
  index: number;
}

export interface RecordSchemaTraverserContext<K extends AnySubSchemaKey>
  extends AbstractSchemaTraverserContext<"record", K> {
  parent: Schema;
  key: SubSchemasRecordKey & K;
  property: string;
}

export interface SubSchemaTraverserContext<K extends AnySubSchemaKey>
  extends AbstractSchemaTraverserContext<"sub", K> {
  parent: Schema;
  key: SubSchemaKey & K;
}
export interface RootSchemaTraverserContext<K extends AnySubSchemaKey>
  extends AbstractSchemaTraverserContext<"root", K> {}

export type SchemaTraverserContext<K extends AnySubSchemaKey> =
  | ArraySchemaTraverserContext<K>
  | RecordSchemaTraverserContext<K>
  | SubSchemaTraverserContext<K>
  | RootSchemaTraverserContext<K>;

export type SchemaDefinitionVisitor<K extends AnySubSchemaKey, R> = Visitor<
  SchemaDefinition,
  SchemaTraverserContext<K>,
  R
>;
