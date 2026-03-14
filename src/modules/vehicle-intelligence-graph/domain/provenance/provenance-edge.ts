import { ProvenanceRelation } from './provenance-relation';
import { ProvenanceEdgeType } from '../enums/provenance-edge-type';

export interface ProvenanceEdge {
  id: string;
  relationType: ProvenanceEdgeType;
  fromNodeId: string;
  toNodeId: string;
  vehicleId: string;
  createdAt: string;
  observedAt?: string;
  processRef?: string;
  recordRef?: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function toProvenanceEdge(relation: ProvenanceRelation): ProvenanceEdge {
  return {
    id: `prov:${relation.fromNodeId}:${relation.relationType}:${relation.toNodeId}`,
    relationType: relation.relationType,
    fromNodeId: relation.fromNodeId,
    toNodeId: relation.toNodeId,
    vehicleId: relation.vehicleId,
    createdAt: relation.observedAt ?? new Date(0).toISOString(),
    observedAt: relation.observedAt,
    processRef: relation.processRef,
    recordRef: relation.recordRef,
    context: relation.context,
    metadata: relation.metadata,
  };
}
