import { DataEngineGraphInput } from '../data-engine-graph-input';
import { VehicleGraphSchema } from '../../domain/schemas/vehicle-graph-schema';
import { assembleVehicleRootNode } from './vehicle-root-assembler';
import { assembleEventNodes } from './event-node-assembler';
import { assembleSourceNodes } from './source-node-assembler';
import { assembleIntelligenceNodes } from './intelligence-node-assembler';
import { generateGraphEdges } from './edge-generator';

export function assembleVehicleGraph(
  input: DataEngineGraphInput
): VehicleGraphSchema {
  const root = assembleVehicleRootNode(input);
  const events = assembleEventNodes(input);
  const sources = assembleSourceNodes(input);
  const intelligence = assembleIntelligenceNodes(input);
  const edges = generateGraphEdges(root, events, sources, intelligence);

  return {
    root,
    events,
    sources,
    intelligence,
    edges,
  };
}
