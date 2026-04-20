/**
 * NonEmptyReadonlyArray - Declarative type for readonly arrays with at least one element
 * Pure structural type with no runtime behavior.
 * Ensures compile-time that a collection is not empty.
 */
export type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];
