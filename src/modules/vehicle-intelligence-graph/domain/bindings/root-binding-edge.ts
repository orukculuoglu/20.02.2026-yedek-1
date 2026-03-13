import { VehicleRootBinding } from './vehicle-root-binding';
import { GraphEdge } from '../edges/graph-edge';

export function toRootBindingEdge(binding: VehicleRootBinding): GraphEdge {
  return {
    id: `root-bind:${binding.rootNodeId}:${binding.bindingEdgeType}:${binding.targetNodeId}`,
    edgeType: binding.bindingEdgeType,
    fromNodeId: binding.rootNodeId,
    toNodeId: binding.targetNodeId,
    vehicleId: binding.vehicleId,
    createdAt: binding.boundAt,
    context: binding.context,
    provenance: binding.provenance,
    trust: binding.trust,
    metadata: binding.metadata,
  };
}
