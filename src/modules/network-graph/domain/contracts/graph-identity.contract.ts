/**
 * Graph Identity Contracts
 * Minimal identity type specifications for graph entities.
 * All identifiers are caller-provided only.
 * No ID generation, no validation logic, pure structural specification.
 */

/**
 * GraphNodeIdentity
 * Minimal identity specification for a graph node.
 * Caller must provide nodeId.
 */
export interface GraphNodeIdentity {
  /** Unique node identifier (caller-provided) */
  nodeId: string;
}

/**
 * GraphEdgeIdentity
 * Minimal identity specification for a graph edge.
 * Caller must provide edgeId.
 */
export interface GraphEdgeIdentity {
  /** Unique edge identifier (caller-provided) */
  edgeId: string;
}

/**
 * GraphRelationIdentity
 * Minimal identity specification for a graph relation.
 * Caller must provide relationId.
 */
export interface GraphRelationIdentity {
  /** Unique relation identifier (caller-provided) */
  relationId: string;
}
