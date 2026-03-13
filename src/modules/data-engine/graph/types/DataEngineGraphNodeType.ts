/**
 * Data Engine Graph Node Type Enumeration
 *
 * Explicit node family taxonomy for graph attachment layer.
 * Defines the five node family types supported by the graph model.
 */

export type DataEngineGraphNodeType =
  | 'VEHICLE'      // Vehicle anchor node (exactly one per graph)
  | 'EVENT'        // Work events, incidents, recorded actions
  | 'OBSERVATION'  // Measurements, assessments, inspections, diagnostics
  | 'ACTOR'        // Participants, sources, originators
  | 'ASSET';       // Components, parts, physical assets
