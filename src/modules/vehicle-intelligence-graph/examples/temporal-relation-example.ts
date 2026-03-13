import { TemporalRelation } from '../domain/temporal/temporal-relation';
import { TemporalEdgeType } from '../domain/enums/temporal-edge-type';

export const validTemporalRelation: TemporalRelation = {
  fromNodeId: 'event-2024-service-001',
  toNodeId: 'event-2024-service-002',
  relationType: TemporalEdgeType.PRECEDES,
  vehicleId: 'VIN-WDB9041141G123456',
  observedAt: '2024-03-15T10:30:00Z',
  context: {
    serviceSequence: 2,
    facility: 'Main Service Center',
  },
  provenance: {
    source: 'workshop-management-system',
    version: '1.0.0',
  },
  metadata: {
    confidence: 0.99,
  },
};

export const invalidTemporalRelation: TemporalRelation = {
  fromNodeId: 'event-2024-fault-001',
  toNodeId: 'event-2024-fault-001',
  relationType: TemporalEdgeType.VALID_DURING,
  vehicleId: 'VIN-WDB9041141G123456',
};
