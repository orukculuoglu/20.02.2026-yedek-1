import { FederationEdgeType } from '../enums/federation-edge-type';

export interface FederationRelation {
  fromGraphId: string;
  targetGraphId: string;
  relationType: FederationEdgeType;
  vehicleId: string;
  linkedAt: string;
  context?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
