/**
 * Vehicle Intelligence Graph Module
 *
 * Public export surface for the Vehicle Intelligence Graph domain model.
 */

// Enums
export { GraphNodeType } from './domain/enums/graph-node-type';
export { GraphEdgeType } from './domain/enums/graph-edge-type';
export { TemporalEdgeType } from './domain/enums/temporal-edge-type';
export { ContextEdgeType } from './domain/enums/context-edge-type';

// Base contracts and node contracts
export type { GraphNode } from './domain/nodes/graph-node';
export type { VehicleRootNode } from './domain/nodes/vehicle-root-node';
export type { EventNode } from './domain/nodes/event-node';
export type { SourceNode } from './domain/nodes/source-node';
export type { IntelligenceNode } from './domain/nodes/intelligence-node';

// Edge contracts
export type { GraphEdge } from './domain/edges/graph-edge';

// Temporal relationships
export type { TemporalRelation } from './domain/temporal/temporal-relation';
export type { TemporalEdge } from './domain/temporal/temporal-edge';
export { toTemporalEdge } from './domain/temporal/temporal-edge';
export { isValidTemporalRelation } from './domain/temporal/temporal-relation-validator';

// Context relationships
export type { ContextRelation } from './domain/context/context-relation';
export type { ContextEdge } from './domain/context/context-edge';
export { toContextEdge } from './domain/context/context-edge';
export { isValidContextRelation } from './domain/context/context-relation-validator';

// Schema
export type { VehicleGraphSchema } from './domain/schemas/vehicle-graph-schema';

// Binding contracts and validators
export type { VehicleRootBinding } from './domain/bindings/vehicle-root-binding';
export { ROOT_BINDING_RULES } from './domain/bindings/root-binding-rules';
export { isValidRootBinding } from './domain/bindings/root-binding-validator';
export { toRootBindingEdge } from './domain/bindings/root-binding-edge';
export { executeRootBinding } from './domain/bindings/execute-root-binding';

// Example payloads
export { vehicleGraphExample } from './examples/vehicle-graph-example';
export { validVehicleRootBinding, invalidVehicleRootBinding } from './examples/vehicle-root-binding-example';
export { validTemporalRelation, invalidTemporalRelation } from './examples/temporal-relation-example';
export { validContextRelation, invalidContextRelation } from './examples/context-relation-example';
