import { GraphIndex } from './graph-index';
import { GraphIndexType } from './graph-index-type';
import { GraphQueryResult } from '../query/graph-query-result';

export function toGraphIndex(
  result: GraphQueryResult,
  indexType: GraphIndexType
): GraphIndex {
  return {
    indexId: `index:${result.queryId}:${indexType}`,
    indexType: indexType,
    vehicleId: result.vehicleId,
    nodeIds: result.matchedNodeIds,
    edgeIds: result.matchedEdgeIds,
    sourceQueryId: result.queryId,
    createdAt: new Date(0).toISOString(),
    context: result.context,
    metadata: result.metadata,
  };
}
