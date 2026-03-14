/**
 * Vehicle Intelligence Graph Module
 *
 * Public export surface for the complete Vehicle Intelligence Graph domain model.
 * Covers graph structure, semantics, queries, indexes, signals, federation, validation, and reference examples.
 */

// Enums
export { GraphNodeType } from './domain/enums/graph-node-type';
export { GraphEdgeType } from './domain/enums/graph-edge-type';
export { TemporalEdgeType } from './domain/enums/temporal-edge-type';
export { ContextEdgeType } from './domain/enums/context-edge-type';
export { IntelligenceEdgeType } from './domain/enums/intelligence-edge-type';
export { ProvenanceEdgeType } from './domain/enums/provenance-edge-type';
export { TrustEdgeType } from './domain/enums/trust-edge-type';
export { GraphQueryType } from './domain/query/graph-query-type';
export { GraphIndexType } from './domain/index/graph-index-type';
export { GraphSignalType } from './domain/signal/graph-signal-type';
export { FederationEdgeType } from './domain/enums/federation-edge-type';

// Core graph contracts
export type { GraphNode } from './domain/nodes/graph-node';
export type { VehicleRootNode } from './domain/nodes/vehicle-root-node';
export type { EventNode } from './domain/nodes/event-node';
export type { SourceNode } from './domain/nodes/source-node';
export type { IntelligenceNode } from './domain/nodes/intelligence-node';
export type { GraphEdge } from './domain/edges/graph-edge';
export type { VehicleGraphSchema } from './domain/schemas/vehicle-graph-schema';

// Root binding
export type { VehicleRootBinding } from './domain/bindings/vehicle-root-binding';
export { ROOT_BINDING_RULES } from './domain/bindings/root-binding-rules';
export { isValidRootBinding } from './domain/bindings/root-binding-validator';
export { toRootBindingEdge } from './domain/bindings/root-binding-edge';
export { executeRootBinding } from './domain/bindings/execute-root-binding';

// Temporal
export type { TemporalRelation } from './domain/temporal/temporal-relation';
export type { TemporalEdge } from './domain/temporal/temporal-edge';
export { toTemporalEdge } from './domain/temporal/temporal-edge';
export { isValidTemporalRelation } from './domain/temporal/temporal-relation-validator';

// Context
export type { ContextRelation } from './domain/context/context-relation';
export type { ContextEdge } from './domain/context/context-edge';
export { toContextEdge } from './domain/context/context-edge';
export { isValidContextRelation } from './domain/context/context-relation-validator';

// Intelligence
export type { IntelligenceAttachment } from './domain/intelligence/intelligence-attachment';
export type { IntelligenceEdge } from './domain/intelligence/intelligence-edge';
export { toIntelligenceEdge } from './domain/intelligence/intelligence-edge';
export { isValidIntelligenceAttachment } from './domain/intelligence/intelligence-attachment-validator';

// Provenance
export type { ProvenanceRelation } from './domain/provenance/provenance-relation';
export type { ProvenanceEdge } from './domain/provenance/provenance-edge';
export { toProvenanceEdge } from './domain/provenance/provenance-edge';
export { isValidProvenanceRelation } from './domain/provenance/provenance-relation-validator';

// Trust
export type { TrustRelation } from './domain/trust/trust-relation';
export type { TrustEdge } from './domain/trust/trust-edge';
export { toTrustEdge } from './domain/trust/trust-edge';
export { isValidTrustRelation } from './domain/trust/trust-relation-validator';

// Query
export type { GraphQuery } from './domain/query/graph-query';
export type { GraphQueryResult } from './domain/query/graph-query-result';
export { isValidGraphQuery } from './domain/query/graph-query-validator';

// Index
export type { GraphIndex } from './domain/index/graph-index';
export { toGraphIndex } from './domain/index/graph-index-projection';
export { isValidGraphIndex } from './domain/index/graph-index-validator';

// Signal
export type { GraphSignal } from './domain/signal/graph-signal';
export { toGraphSignal } from './domain/signal/graph-signal-projection';
export { isValidGraphSignal } from './domain/signal/graph-signal-validator';

// Federation
export type { FederationRelation } from './domain/federation/federation-relation';
export type { FederationEdge } from './domain/federation/federation-edge';
export { toFederationEdge } from './domain/federation/federation-edge';
export { isValidFederationRelation } from './domain/federation/federation-relation-validator';

// Canonical examples
export { vehicleGraphExample } from './examples/vehicle-graph-example';
export { validVehicleRootBinding, invalidVehicleRootBinding } from './examples/vehicle-root-binding-example';
export { validTemporalRelation, invalidTemporalRelation } from './examples/temporal-relation-example';
export { validContextRelation, invalidContextRelation } from './examples/context-relation-example';
export { validIntelligenceAttachment, invalidIntelligenceAttachment } from './examples/intelligence-attachment-example';
export { validProvenanceRelation, invalidProvenanceRelation } from './examples/provenance-relation-example';
export { validTrustRelation, invalidTrustRelation } from './examples/trust-relation-example';
export { validGraphQuery, invalidGraphQuery } from './examples/graph-query-example';
export { validGraphIndex, invalidGraphIndex } from './examples/graph-index-example';
export { validGraphSignal, invalidGraphSignal } from './examples/graph-signal-example';
export { validFederationRelation, invalidFederationRelation } from './examples/federation-relation-example';
