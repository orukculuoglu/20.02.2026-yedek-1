import { IntelligenceAttachment } from './intelligence-attachment';
import { IntelligenceEdgeType } from '../enums/intelligence-edge-type';

export interface IntelligenceEdge {
  id: string;
  attachmentType: IntelligenceEdgeType;
  intelligenceNodeId: string;
  targetNodeId: string;
  vehicleId: string;
  createdAt: string;
  attachedAt: string;
  context?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function toIntelligenceEdge(attachment: IntelligenceAttachment): IntelligenceEdge {
  return {
    id: `intel:${attachment.intelligenceNodeId}:${attachment.attachmentType}:${attachment.targetNodeId}`,
    attachmentType: attachment.attachmentType,
    intelligenceNodeId: attachment.intelligenceNodeId,
    targetNodeId: attachment.targetNodeId,
    vehicleId: attachment.vehicleId,
    createdAt: attachment.attachedAt,
    attachedAt: attachment.attachedAt,
    context: attachment.context,
    provenance: attachment.provenance,
    metadata: attachment.metadata,
  };
}
