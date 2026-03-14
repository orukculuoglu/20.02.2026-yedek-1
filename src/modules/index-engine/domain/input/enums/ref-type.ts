/**
 * Enumeration of reference types that link to upstream graph artifacts.
 * Specifies the origin and type of traceability references.
 * 
 * - GRAPH_SIGNAL: Reference to a GraphSignal from Vehicle Intelligence Graph
 * - GRAPH_INDEX: Reference to a GraphIndex from Vehicle Intelligence Graph
 * - GRAPH_NODE: Reference to a graph node (event, source, intelligence)
 * - GRAPH_EDGE: Reference to a graph edge (relationship)
 * - DATA_SOURCE: Reference to a data source providing evidence
 * - CALCULATION: Reference to a previous index calculation
 */
export enum RefType {
  GRAPH_SIGNAL = 'GRAPH_SIGNAL',
  GRAPH_INDEX = 'GRAPH_INDEX',
  GRAPH_NODE = 'GRAPH_NODE',
  GRAPH_EDGE = 'GRAPH_EDGE',
  DATA_SOURCE = 'DATA_SOURCE',
  CALCULATION = 'CALCULATION',
}
