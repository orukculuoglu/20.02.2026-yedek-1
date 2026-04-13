/**
 * Graph Relation Contract
 * Structural specification for graph relations.
 * Composes Phase 1 type language into minimal relation contract.
 * All identities, kinds, categories, and timestamps caller-provided only.
 * No validation logic, no runtime behavior, pure structural specification.
 */

import type { GraphRelationIdentity } from "./graph-identity.contract.ts";
import type { GraphRelationKind } from "./graph-relation-kind.ts";
import type { GraphRelationDirection } from "./graph-relation-direction.ts";
import type { GraphEntityCategory } from "./graph-entity-category.ts";
import type { GraphMetadata } from "./graph-metadata.contract.ts";
import type { GraphTimestamps } from "./graph-timestamp.contract.ts";

/**
 * GraphRelation
 * Minimal structural specification for a graph relation.
 * Composition of relation identity, kind, direction, entity categories, optional metadata, and optional timestamps.
 * Defines valid relation types between entity category pairs.
 * Caller must provide relationId, kind, direction, sourceCategory, and targetCategory.
 */
export interface GraphRelation extends GraphRelationIdentity {
  /** Relation type classification (caller-provided, required) */
  kind: GraphRelationKind;

  /** Relation directionality semantic (caller-provided, required) */
  direction: GraphRelationDirection;

  /** Source entity category (caller-provided, required) */
  sourceCategory: GraphEntityCategory;

  /** Target entity category (caller-provided, required) */
  targetCategory: GraphEntityCategory;

  /** Optional descriptive metadata (caller-provided) */
  metadata?: GraphMetadata;

  /** Optional temporal information (caller-provided) */
  timestamps?: GraphTimestamps;
}
