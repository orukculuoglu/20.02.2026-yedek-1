import { TemporalEdgeType } from '../enums/temporal-edge-type';

export interface TemporalRelation {
  fromNodeId: string;
  toNodeId: string;
  relationType: TemporalEdgeType;
  vehicleId: string;
  observedAt?: string;
  validFrom?: string;
  validTo?: string;
  context?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
