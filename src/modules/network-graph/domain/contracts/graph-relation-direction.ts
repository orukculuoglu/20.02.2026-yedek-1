/**
 * Graph Relation Direction
 * Enumeration of directional classifications for graph relations.
 * Foundational vocabulary for relationship directionality semantics.
 */

export enum GraphRelationDirection {
  /** Directed - relation flows from source to target only */
  DIRECTED = "directed",

  /** Undirected - relation is symmetric with no inherent direction */
  UNDIRECTED = "undirected",

  /** Bidirectional - relation flows both source-to-target and target-to-source */
  BIDIRECTIONAL = "bidirectional",
}
