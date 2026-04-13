/**
 * Graph Relation Kind Enumeration
 * Structural vocabulary for graph relation types.
 * Defines semantic categories of relations between entity pairs.
 * No validation, no policy enforcement, pure classification only.
 */

/**
 * GraphRelationKind
 * Minimal enumeration of relation type semantics.
 * Used to classify relations by their conceptual nature.
 * Extensible for future domain modeling needs.
 */
export enum GraphRelationKind {
  /** Hierarchical composition: one entity contains another */
  COMPOSITIONAL = "compositional",

  /** Operational relationships: entities operating together */
  OPERATIONAL = "operational",

  /** Geographic spatial relationships: location-based associations */
  GEOGRAPHIC = "geographic",

  /** Participant role relationships: assignments and responsibilities */
  PARTICIPANT = "participant",

  /** General reference relationships: cross-linking and references */
  REFERENCE = "reference",
}
