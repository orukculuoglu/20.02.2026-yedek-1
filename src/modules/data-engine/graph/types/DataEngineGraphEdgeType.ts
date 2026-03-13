/**
 * Data Engine Graph Edge Type Enumeration
 *
 * Seven semantic relationship types connecting graph nodes.
 * Each type represents a meaningful relationship in vehicle maintenance context.
 */

export type DataEngineGraphEdgeType =
  | 'HAS_EVENT'        // Vehicle has recorded work/incident events
  | 'HAS_OBSERVATION'  // Vehicle has measurements/assessments
  | 'INVOLVES_ACTOR'   // Event/observation involves a participant
  | 'INVOLVES_ASSET'   // Event involves a component/part
  | 'OBSERVED_BY'      // Observation originates from a source
  | 'PRODUCED_BY'      // Event/asset created or recorded by an actor
  | 'RELATED_TO';      // Generic semantic relationship
