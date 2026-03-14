import { TrustEdgeType } from '../enums/trust-edge-type';

export interface TrustRelation {
  fromNodeId: string;
  toNodeId: string;
  relationType: TrustEdgeType;
  vehicleId: string;
  observedAt?: string;
  confidenceScore?: number;
  evidenceRef?: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
