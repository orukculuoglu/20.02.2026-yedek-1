import { TrustRelation } from './trust-relation';
import { TrustEdgeType } from '../enums/trust-edge-type';

export interface TrustEdge {
  id: string;
  relationType: TrustEdgeType;
  fromNodeId: string;
  toNodeId: string;
  vehicleId: string;
  createdAt: string;
  observedAt?: string;
  confidenceScore?: number;
  evidenceRef?: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function toTrustEdge(relation: TrustRelation): TrustEdge {
  return {
    id: `trust:${relation.fromNodeId}:${relation.relationType}:${relation.toNodeId}`,
    relationType: relation.relationType,
    fromNodeId: relation.fromNodeId,
    toNodeId: relation.toNodeId,
    vehicleId: relation.vehicleId,
    createdAt: relation.observedAt ?? new Date(0).toISOString(),
    observedAt: relation.observedAt,
    confidenceScore: relation.confidenceScore,
    evidenceRef: relation.evidenceRef,
    context: relation.context,
    metadata: relation.metadata,
  };
}
