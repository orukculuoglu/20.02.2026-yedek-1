import { TemporalEdgeType } from '../enums/temporal-edge-type';
import { TemporalRelation } from './temporal-relation';

export interface TemporalEdge {
  id: string;
  relationType: TemporalEdgeType;
  fromNodeId: string;
  toNodeId: string;
  vehicleId: string;
  createdAt: string;
  observedAt?: string;
  validFrom?: string;
  validTo?: string;
  context?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function toTemporalEdge(relation: TemporalRelation): TemporalEdge {
  return {
    id: `temporal:${relation.fromNodeId}:${relation.relationType}:${relation.toNodeId}`,
    relationType: relation.relationType,
    fromNodeId: relation.fromNodeId,
    toNodeId: relation.toNodeId,
    vehicleId: relation.vehicleId,
    createdAt: relation.observedAt ?? relation.validFrom ?? relation.validTo ?? new Date(0).toISOString(),
    observedAt: relation.observedAt,
    validFrom: relation.validFrom,
    validTo: relation.validTo,
    context: relation.context,
    provenance: relation.provenance,
    metadata: relation.metadata,
  };
}
