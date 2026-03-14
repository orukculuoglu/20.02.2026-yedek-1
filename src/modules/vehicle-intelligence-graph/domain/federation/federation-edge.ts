import { FederationRelation } from './federation-relation';
import { FederationEdgeType } from '../enums/federation-edge-type';

export interface FederationEdge {
  id: string;
  relationType: FederationEdgeType;
  fromGraphId: string;
  targetGraphId: string;
  vehicleId: string;
  createdAt: string;
  linkedAt: string;
  context?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function toFederationEdge(relation: FederationRelation): FederationEdge {
  return {
    id: `federation:${relation.fromGraphId}:${relation.relationType}:${relation.targetGraphId}`,
    relationType: relation.relationType,
    fromGraphId: relation.fromGraphId,
    targetGraphId: relation.targetGraphId,
    vehicleId: relation.vehicleId,
    createdAt: relation.linkedAt,
    linkedAt: relation.linkedAt,
    context: relation.context,
    provenance: relation.provenance,
    metadata: relation.metadata,
  };
}
