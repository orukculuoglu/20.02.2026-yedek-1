import { DataEngineGraphInput } from '../data-engine-graph-input';
import { VehicleRootNode } from '../../domain/nodes/vehicle-root-node';
import { GraphNodeType } from '../../domain/enums/graph-node-type';

export function assembleVehicleRootNode(
  input: DataEngineGraphInput
): VehicleRootNode {
  return {
    id: `vehicle-root:${input.vehicleId}`,
    nodeType: GraphNodeType.VEHICLE_ROOT,
    vehicleId: input.vehicleId,
    identityRef: input.identityRef,
    createdAt: new Date(0).toISOString(),
    context: input.context,
    metadata: input.metadata,
  };
}
