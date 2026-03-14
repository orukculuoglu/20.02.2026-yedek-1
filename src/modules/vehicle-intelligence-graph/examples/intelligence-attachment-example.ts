import { IntelligenceAttachment } from '../domain/intelligence/intelligence-attachment';
import { IntelligenceEdgeType } from '../domain/enums/intelligence-edge-type';

export const validIntelligenceAttachment: IntelligenceAttachment = {
  intelligenceNodeId: 'intel-maintenance-score-001',
  targetNodeId: 'event-2024-service-001',
  attachmentType: IntelligenceEdgeType.DERIVED_FROM_EVENT,
  vehicleId: 'VIN-WDB9041141G123456',
  attachedAt: '2024-03-15T11:45:00Z',
  context: {
    derivationType: 'predictive-maintenance',
    confidence: 0.92,
  },
  provenance: {
    source: 'ai-intelligence-engine',
    version: '3.2.1',
  },
  metadata: {
    modelId: 'maintenance-risk-v2',
  },
};

export const invalidIntelligenceAttachment: IntelligenceAttachment = {
  intelligenceNodeId: 'intel-fault-diagnosis-002',
  targetNodeId: 'intel-fault-diagnosis-002',
  attachmentType: IntelligenceEdgeType.CORRELATED_WITH_INTELLIGENCE,
  vehicleId: 'VIN-WDB9041141G123456',
  attachedAt: '2024-03-15T12:00:00Z',
};
