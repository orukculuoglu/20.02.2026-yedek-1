/**
 * Graph Relation Input Collection Contract
 * Structural specification for relation input collection during graph assembly.
 * Carries only the caller-provided collection of relations.
 * No validation, no lookup, no mutation, pure structural collection specification.
 */

import type { GraphRelation } from "../../domain/contracts/index.ts";

/**
 * GraphRelationInputCollection
 * Minimal structural specification for relation input collection.
 * Carries relations to be assembled into the graph.
 * Caller must provide all relations explicitly.
 */
export interface GraphRelationInputCollection {
  /** Graph relations collection (caller-provided, required) */
  readonly relations: readonly GraphRelation[];
}
