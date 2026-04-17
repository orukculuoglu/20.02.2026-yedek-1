/**
 * Graph Observation Scope Contract
 * Defines the structural scope surface for graph intelligence observation.
 * Specifies which parts of the graph structure to focus on during evaluation.
 * Pure structural constraint vocabulary, no policy, no analysis guidance, no runtime behavior.
 */

/**
 * GraphObservationScope
 * Minimal structural contract for observation scope definition.
 * Defines explicit focus areas and boundaries for graph observation.
 * All scope elements are caller-provided; undefined means no constraint applied.
 */
export interface GraphObservationScope {
  /** Optional set of node identifiers to focus observation on (caller-provided) */
  readonly focusNodeIds?: readonly string[];

  /** Optional set of edge identifiers to focus observation on (caller-provided) */
  readonly focusEdgeIds?: readonly string[];

  /** Optional set of relation identifiers to focus observation on (caller-provided) */
  readonly focusRelationIds?: readonly string[];

  /** Optional observation mode constraint (caller-provided, no runtime default behavior) */
  readonly observationMode?: "full_graph" | "subgraph" | "component" | "focused";

  /** Optional depth limit for structural navigation from focus points (caller-provided, no limit if undefined) */
  readonly maxDepth?: number;
}
