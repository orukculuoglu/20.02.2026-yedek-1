/**
 * Vehicle Intelligence Graph - Canonical Binding Examples
 *
 * Demonstrates valid and invalid root bindings for testing the binding contract
 * and validator behavior.
 */

import type { VehicleRootBinding } from '../domain/bindings/vehicle-root-binding';
import { GraphNodeType } from '../domain/enums/graph-node-type';
import { GraphEdgeType } from '../domain/enums/graph-edge-type';

/**
 * Valid root-to-event binding
 *
 * A valid binding where:
 * - targetNodeType is EVENT
 * - bindingEdgeType is HAS_EVENT (correct for EVENT nodes)
 */
export const validVehicleRootBinding: VehicleRootBinding = {
  rootNodeId: 'vroot-abc123def456',
  vehicleId: 'VID-2024-00001',
  targetNodeId: 'evt-inspection-001a',
  targetNodeType: GraphNodeType.EVENT,
  bindingEdgeType: GraphEdgeType.HAS_EVENT,
  boundAt: '2024-03-10T10:15:00Z',
  context: {
    binding_reason: 'inspection_event_discovered',
  },
  provenance: {
    system: 'vehicle_intelligence_graph',
  },
  trust: {
    reliability: 0.95,
  },
};

/**
 * Invalid root-to-event binding
 *
 * An invalid binding where:
 * - targetNodeType is EVENT
 * - bindingEdgeType is HAS_SOURCE (incorrect for EVENT nodes)
 *
 * This binding fails validation because EVENT nodes must attach via HAS_EVENT edges.
 */
export const invalidVehicleRootBinding: VehicleRootBinding = {
  rootNodeId: 'vroot-abc123def456',
  vehicleId: 'VID-2024-00001',
  targetNodeId: 'evt-inspection-001a',
  targetNodeType: GraphNodeType.EVENT,
  bindingEdgeType: GraphEdgeType.HAS_SOURCE,
  boundAt: '2024-03-10T10:15:00Z',
  context: {
    binding_reason: 'inspection_event_discovered',
  },
  provenance: {
    system: 'vehicle_intelligence_graph',
  },
  trust: {
    reliability: 0.95,
  },
};
