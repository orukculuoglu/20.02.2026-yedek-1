/**
 * Graph Intelligence Observation Contracts
 * Distinguishes between local and network intelligence observations through explicit structural separation.
 * Local observations target specific entities; network observations target structural subjects.
 * Pure structural carriers, no scoring, no recommendations, no policy, no propagation logic.
 */

/**
 * GraphIntelligenceLocalObservation
 * Represents an observation about a specific entity in the graph.
 * Targets a concrete node, edge, or relation with explicit subject.
 */
export interface GraphIntelligenceLocalObservation {
  /** Discriminant: marks this as a local observation */
  readonly kind: "local";

  /** Kind of observed entity: node, edge, or relation */
  readonly entityKind: "node" | "edge" | "relation";

  /** Identifier of the observed entity (from input graph, caller-provided, immutable) */
  readonly entityId: string;
}

/**
 * GraphIntelligenceNetworkObservation
 * Represents an observation about network-level structure.
 * Targets sets of entities that form structural patterns, not a single entity.
 */
export interface GraphIntelligenceNetworkObservation {
  /** Discriminant: marks this as a network observation */
  readonly kind: "network";

  /** Optional set of node identifiers involved in observed structure (caller-provided) */
  readonly nodeIds?: readonly string[];

  /** Optional set of edge identifiers involved in observed structure (caller-provided) */
  readonly edgeIds?: readonly string[];

  /** Optional set of relation identifiers involved in observed structure (caller-provided) */
  readonly relationIds?: readonly string[];
}

/**
 * GraphIntelligenceObservation
 * Discriminated union of local and network intelligence observations.
 * Type narrowing via `kind` field provides structural distinction.
 * Local observations target single entities; network observations target entity sets.
 */
export type GraphIntelligenceObservation =
  | GraphIntelligenceLocalObservation
  | GraphIntelligenceNetworkObservation;

