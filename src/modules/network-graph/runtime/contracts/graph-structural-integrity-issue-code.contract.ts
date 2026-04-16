/**
 * Graph Structural Integrity Issue Code Vocabulary
 * Defines the structural integrity issue classification vocabulary only.
 * These codes classify structural graph defects (not business/semantic issues).
 * No logic, no policy meaning, no scoring meaning.
 */

/**
 * GraphStructuralIntegrityIssueCode
 * Enumeration of structural graph issue types.
 * Only structural defects: duplicates, missing references, empty state.
 * Not business validation, not semantic interpretation.
 */
export enum GraphStructuralIntegrityIssueCode {
  /** Graph contains no nodes, edges, or relations */
  GRAPH_EMPTY = "GRAPH_EMPTY",

  /** Graph contains duplicate node identifiers */
  DUPLICATE_NODE_ID = "DUPLICATE_NODE_ID",

  /** Graph contains duplicate edge identifiers */
  DUPLICATE_EDGE_ID = "DUPLICATE_EDGE_ID",

  /** Graph contains duplicate relation identifiers */
  DUPLICATE_RELATION_ID = "DUPLICATE_RELATION_ID",

  /** Edge sourceNodeId does not exist in assembled nodes collection */
  EDGE_SOURCE_NODE_MISSING = "EDGE_SOURCE_NODE_MISSING",

  /** Edge targetNodeId does not exist in assembled nodes collection */
  EDGE_TARGET_NODE_MISSING = "EDGE_TARGET_NODE_MISSING",
}
