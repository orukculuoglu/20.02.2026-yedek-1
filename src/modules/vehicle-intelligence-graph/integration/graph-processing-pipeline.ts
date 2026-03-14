import { DataEngineGraphInput } from './data-engine-graph-input';
import { GraphQuery } from '../domain/query/graph-query';
import { VehicleGraphSchema } from '../domain/schemas/vehicle-graph-schema';
import { GraphQueryResult } from '../domain/query/graph-query-result';
import { GraphIndex } from '../domain/index/graph-index';
import { GraphSignal } from '../domain/signal/graph-signal';

import { buildVehicleGraphRuntime } from './graph-runtime-orchestrator';
import { executeGraphQuery } from './services/graph-query-service';
import { projectGraphIndex } from './services/graph-index-service';
import { projectGraphSignal } from './services/graph-signal-service';

export function processVehicleGraph(
  input: DataEngineGraphInput,
  query: GraphQuery
): {
  graph: VehicleGraphSchema;
  result: GraphQueryResult;
  index: GraphIndex;
  signal: GraphSignal;
} {
  const graph = buildVehicleGraphRuntime(input);
  const result = executeGraphQuery(graph, query);
  const index = projectGraphIndex(result, graph);
  const signal = projectGraphSignal(index, graph);

  return {
    graph,
    result,
    index,
    signal,
  };
}
