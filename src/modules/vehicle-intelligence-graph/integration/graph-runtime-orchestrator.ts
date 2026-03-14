import { DataEngineGraphInput } from './data-engine-graph-input';
import { VehicleGraphSchema } from '../domain/schemas/vehicle-graph-schema';
import { assembleVehicleGraph } from './assemblers/vehicle-graph-assembler';

export function buildVehicleGraphRuntime(
  input: DataEngineGraphInput
): VehicleGraphSchema {
  return assembleVehicleGraph(input);
}
