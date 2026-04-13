/**
 * Graph Edge Contract
 * Structural specification for graph edges.
 * Composes Phase 1 type language into minimal edge contract.
 * All identities, kinds, directions, and timestamps caller-provided only.
 * No validation logic, no runtime behavior, pure structural specification.
 */

import type { GraphEdgeIdentity } from "./graph-identity.contract.ts";
import type { GraphEdgeKind } from "./graph-edge-kind.ts";
import type { GraphRelationDirection } from "./graph-relation-direction.ts";
import type { GraphMetadata } from "./graph-metadata.contract.ts";
import type { GraphTimestamps } from "./graph-timestamp.contract.ts";

/**
 * GraphEdge
 * Minimal structural specification for a graph edge.
 * Composition of edge identity, kind, direction, optional metadata, and optional timestamps.
 * Represents a directional connection between two nodes.
 * Caller must provide edgeId, sourceNodeId, targetNodeId, kind, and direction.
 */
export interface GraphEdge extends GraphEdgeIdentity {
  /** Source node identifier (caller-provided, required) */
  sourceNodeId: string;

  /** Target node identifier (caller-provided, required) */
  targetNodeId: string;

  /** Edge classification (caller-provided, required) */
  kind: GraphEdgeKind;

  /** Edge directionality semantic (caller-provided, required) */
  direction: GraphRelationDirection;

  /** Optional descriptive metadata (caller-provided) */
  metadata?: GraphMetadata;

  /** Optional temporal information (caller-provided) */
  timestamps?: GraphTimestamps;
}
