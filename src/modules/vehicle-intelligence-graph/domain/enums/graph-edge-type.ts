/**
 * Vehicle Intelligence Graph - Edge Type Enumeration
 *
 * Defines the types of relationships (edges) that can exist between nodes in the vehicle intelligence graph.
 */

export enum GraphEdgeType {
  HAS_EVENT = 'HAS_EVENT',
  HAS_SOURCE = 'HAS_SOURCE',
  HAS_INTELLIGENCE = 'HAS_INTELLIGENCE',
  GENERATED_BY_SOURCE = 'GENERATED_BY_SOURCE',
  DERIVED_INTO = 'DERIVED_INTO',
  RELATED_TO_EVENT = 'RELATED_TO_EVENT',
  PRECEDES = 'PRECEDES',
  OCCURRED_WITHIN_CONTEXT = 'OCCURRED_WITHIN_CONTEXT',
}
