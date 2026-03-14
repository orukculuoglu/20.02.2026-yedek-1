import { GraphQueryType } from './graph-query-type';

export interface GraphQuery {
  queryId: string;
  queryType: GraphQueryType;
  vehicleId: string;
  startNodeId?: string;
  relationFilter?: string[];
  timeRange?: {
    from?: string;
    to?: string;
  };
  maxDepth?: number;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
