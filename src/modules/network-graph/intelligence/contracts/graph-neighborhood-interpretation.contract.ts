/**
 * Graph Neighborhood Interpretation Contract
 * Defines the structural shape of node neighborhood interpretations.
 * A neighborhood interpretation describes directly connected entities for a target node.
 * Local-first: captures only immediate structural connectivity.
 * Pure structural carrier, no scoring, no recommendations, no business meaning.
 */

/**
 * GraphNodeNeighborhood
 * Structural interpretation of a node's immediate neighborhood in the graph.
 * Describes direct connectivity to and from the target node.
 * All identifiers are caller-provided; structure is read-only.
 */
export interface GraphNodeNeighborhood {
  /** Discriminant: marks this as a neighborhood interpretation */
  readonly kind: "neighborhood";

  /** Target node being interpreted (caller-provided, from graph structure) */
  readonly targetNodeId: string;

  /** Nodes directly connected to the target node via edges (read-only, caller-verified) */
  readonly directlyConnectedNodeIds: readonly string[];

  /** Edges touching the target node (read-only, caller-verified) */
  readonly directlyConnectedEdgeIds: readonly string[];

  /** Relations touching the target node (read-only, caller-verified) */
  readonly directlyConnectedRelationIds: readonly string[];
}

/**
 * Neighborhood interpretation is always:
 * - Local: reads only direct connectivity, no multi-hop traversal
 * - Structural: describes what is directly connected, not why or what it means
 * - Non-inferential: no interpretation of importance, no scoring, no semantic enrichment
 * - Deterministic: same target node always produces same neighborhood structure
 */
