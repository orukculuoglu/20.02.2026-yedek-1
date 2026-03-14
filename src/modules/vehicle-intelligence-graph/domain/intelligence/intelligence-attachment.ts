import { IntelligenceEdgeType } from '../enums/intelligence-edge-type';

export interface IntelligenceAttachment {
  intelligenceNodeId: string;
  targetNodeId: string;
  attachmentType: IntelligenceEdgeType;
  vehicleId: string;
  attachedAt: string;
  context?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
