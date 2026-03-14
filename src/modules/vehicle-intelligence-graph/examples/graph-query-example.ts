import { GraphQuery } from '../domain/query/graph-query';
import { GraphQueryType } from '../domain/query/graph-query-type';

export const validGraphQuery: GraphQuery = {
  queryId: 'query:node-lookup:vehicle:12345:001',
  queryType: GraphQueryType.NODE_LOOKUP,
  vehicleId: 'vehicle:12345',
  startNodeId: 'node:vehicle:12345:root',
  maxDepth: 2,
  relationFilter: ['HAS_EVENT', 'HAS_SOURCE'],
  context: {
    searchScope: 'vehicle_root_binding',
    purpose: 'intelligence_discovery',
  },
  metadata: {
    priority: 'HIGH',
    requestTime: '2026-03-14T11:00:00Z',
  },
};

export const invalidGraphQuery: GraphQuery = {
  queryId: '',
  queryType: GraphQueryType.NEIGHBORHOOD_TRAVERSAL,
  vehicleId: '',
  maxDepth: 0,
};
