import { GraphQueryType } from './graph-query-type';

export interface GraphQueryResult {
  queryId: string;
  queryType: GraphQueryType;
  vehicleId: string;
  matchedNodeIds: string[];
  matchedEdgeIds: string[];
  traversedPaths?: string[][];
  resultCount: number;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
