/**
 * Graph Relation Interpretation Contract
 * Defines the structural shape of relation-centered interpretations.
 * A relation interpretation describes the explicitly linked local structure around a target relation.
 * Local-first: captures only entities directly linked by the relation structure.
 * Pure structural carrier, no scoring, no recommendations, no business meaning.
 */

/**
 * GraphRelationLocalStructure
 * Structural interpretation of a relation's immediate linked structure in the graph.
 * Describes entities explicitly connected through or by the target relation.
 * All identifiers are caller-provided; structure is read-only.
 */
export interface GraphRelationLocalStructure {
  /** Discriminant: marks this as a relation interpretation */
  readonly kind: "relation";

  /** Target relation being interpreted (caller-provided, from graph structure) */
  readonly targetRelationId: string;

  /** Nodes explicitly linked by this relation (read-only, caller-verified) */
  readonly linkedNodeIds: readonly string[];

  /** Edges explicitly linked by this relation (optional, read-only, caller-verified) */
  readonly linkedEdgeIds?: readonly string[];
}

/**
 * Relation interpretation is always:
 * - Local: reads only entities explicitly referenced by the relation, no derived structure
 * - Structural: describes what is linked by the relation, not why or what it means
 * - Non-inferential: no interpretation of importance, no scoring, no semantic enrichment
 * - Deterministic: same target relation always produces same linked structure
 * - Explicit: includes only identifiers present in the relation's own structure, not inferred connections
 */
