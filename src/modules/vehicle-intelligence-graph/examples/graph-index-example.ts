import { GraphIndex } from '../domain/index/graph-index';
import { GraphIndexType } from '../domain/index/graph-index-type';

export const validGraphIndex: GraphIndex = {
  indexId: 'index:query:node-lookup:vehicle:12345:001:NODE_INDEX',
  indexType: GraphIndexType.NODE_INDEX,
  vehicleId: 'vehicle:12345',
  nodeIds: [
    'node:vehicle:12345:root',
    'node:event:engine:fault:p0101:session:001',
    'node:source:obd2:device:12345',
    'node:intelligence:maintenance:trend:session:001',
  ],
  edgeIds: [
    'edge:node:vehicle:12345:root:HAS_EVENT:node:event:engine:fault:p0101:session:001',
    'edge:node:vehicle:12345:root:HAS_SOURCE:node:source:obd2:device:12345',
    'edge:node:event:engine:fault:p0101:session:001:HAS_INTELLIGENCE:node:intelligence:maintenance:trend:session:001',
  ],
  createdAt: '2026-03-14T11:15:00Z',
  sourceQueryId: 'query:node-lookup:vehicle:12345:001',

  // Summary fields
  vehicleCount: 1,
  eventCount: 1,
  sourceCount: 1,
  intelligenceCount: 1,
  edgeCount: 3,

  temporalSpan: {
    earliest: '2025-01-15T08:30:00Z',
    latest: '2026-03-14T10:45:00Z',
  },

  trustSummary: {
    nodeCount: 4,
    analyzedAt: '2026-03-14T11:15:00Z',
    confidenceScore: 0.95,
  },

  provenanceSummary: {
    sourceCount: 1,
    eventCount: 1,
    intelligenceCount: 1,
  },

  context: {
    indexScope: 'vehicle_root_binding',
    purpose: 'node_discovery',
  },
  metadata: {
    nodeCount: 4,
    edgeCount: 3,
  },
};

export const invalidGraphIndex: GraphIndex = {
  indexId: '',
  indexType: GraphIndexType.EDGE_INDEX,
  vehicleId: '',
  createdAt: '2026-03-14T11:20:00Z',
  vehicleCount: undefined,
  eventCount: undefined,
};
