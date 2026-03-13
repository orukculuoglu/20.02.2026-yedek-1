import { ContextEdgeType } from '../enums/context-edge-type';
import { ContextRelation } from './context-relation';

export interface ContextEdge {
  id: string;
  relationType: ContextEdgeType;
  fromNodeId: string;
  contextNodeId: string;
  vehicleId: string;
  createdAt: string;
  observedAt?: string;
  context?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function toContextEdge(relation: ContextRelation): ContextEdge {
  return {
    id: `context:${relation.fromNodeId}:${relation.relationType}:${relation.contextNodeId}`,
    relationType: relation.relationType,
    fromNodeId: relation.fromNodeId,
    contextNodeId: relation.contextNodeId,
    vehicleId: relation.vehicleId,
    createdAt: relation.observedAt ?? new Date(0).toISOString(),
    observedAt: relation.observedAt,
    context: relation.context,
    provenance: relation.provenance,
    metadata: relation.metadata,
  };
}
