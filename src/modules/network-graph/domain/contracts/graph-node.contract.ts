/**
 * Graph Node Contract
 * Structural specification for graph nodes.
 * Composes Phase 1 type language into minimal node contract.
 * All identities, kinds, and timestamps caller-provided only.
 * No validation logic, no runtime behavior, pure structural specification.
 */

import type { GraphNodeIdentity } from "./graph-identity.contract.ts";
import type { GraphNodeKind } from "./graph-node-kind.ts";
import type { GraphEntityCategory } from "./graph-entity-category.ts";
import type { GraphMetadata } from "./graph-metadata.contract.ts";
import type { GraphTimestamps } from "./graph-timestamp.contract.ts";
import type { GraphNodeAttributes } from "./graph-node-attributes.contract.ts";

/**
 * GraphNode
 * Minimal structural specification for a graph node.
 * Composition of node identity, kind, category, optional metadata, optional timestamps, and optional attributes.
 * Caller must provide nodeId, kind, and category.
 */
export interface GraphNode extends GraphNodeIdentity, GraphNodeAttributes {
  /** Node classification (caller-provided, required) */
  kind: GraphNodeKind;

  /** Node entity category (caller-provided, required) */
  category: GraphEntityCategory;

  /** Optional descriptive metadata (caller-provided) */
  metadata?: GraphMetadata;

  /** Optional temporal information (caller-provided) */
  timestamps?: GraphTimestamps;
}
