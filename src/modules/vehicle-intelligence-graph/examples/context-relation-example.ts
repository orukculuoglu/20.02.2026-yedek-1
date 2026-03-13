import { ContextRelation } from '../domain/context/context-relation';
import { ContextEdgeType } from '../domain/enums/context-edge-type';

export const validContextRelation: ContextRelation = {
  fromNodeId: 'event-2024-service-001',
  contextNodeId: 'domain-vehicle-maintenance',
  relationType: ContextEdgeType.OCCURRED_IN_DOMAIN,
  vehicleId: 'VIN-WDB9041141G123456',
  observedAt: '2024-03-15T10:30:00Z',
  context: {
    domain: 'vehicle-maintenance',
    region: 'EU',
  },
  provenance: {
    source: 'maintenance-management-system',
    version: '2.1.0',
  },
  metadata: {
    confidence: 0.95,
  },
};

export const invalidContextRelation: ContextRelation = {
  fromNodeId: 'intelligence-fault-002',
  contextNodeId: 'intelligence-fault-002',
  relationType: ContextEdgeType.ASSOCIATED_WITH_CONTEXT,
  vehicleId: 'VIN-WDB9041141G123456',
};
