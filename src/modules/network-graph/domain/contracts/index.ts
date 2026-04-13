/**
 * Graph Domain Contracts Layer
 * Export surface for foundational graph type language.
 * Defines the shared structural vocabulary for graph operations.
 */

// Graph node kind enumeration
export { GraphNodeKind } from "./graph-node-kind.ts";

// Graph edge kind enumeration
export { GraphEdgeKind } from "./graph-edge-kind.ts";

// Graph relation kind enumeration
export { GraphRelationKind } from "./graph-relation-kind.ts";

// Graph relation direction enumeration
export { GraphRelationDirection } from "./graph-relation-direction.ts";

// Graph entity category enumeration
export { GraphEntityCategory } from "./graph-entity-category.ts";

// Graph identity contracts
export type { GraphNodeIdentity, GraphEdgeIdentity, GraphRelationIdentity } from "./graph-identity.contract.ts";

// Graph timestamp contracts
export type { GraphTimestamps } from "./graph-timestamp.contract.ts";

// Graph metadata contracts
export type { GraphMetadata } from "./graph-metadata.contract.ts";

// Graph node attributes contracts
export type { GraphNodeAttributes } from "./graph-node-attributes.contract.ts";

// Graph node contracts
export type { GraphNode } from "./graph-node.contract.ts";

// Graph edge contracts
export type { GraphEdge } from "./graph-edge.contract.ts";

// Graph relation contracts
export type { GraphRelation } from "./graph-relation.contract.ts";

// Domain graph reference contracts
export type { ServiceGraphRef } from "./service-graph-ref.contract.ts";
export type { PartGraphRef } from "./part-graph-ref.contract.ts";
export type { RegionGraphRef } from "./region-graph-ref.contract.ts";
export type { FleetGraphRef } from "./fleet-graph-ref.contract.ts";
