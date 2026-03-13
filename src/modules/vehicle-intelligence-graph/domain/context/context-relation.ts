import { ContextEdgeType } from '../enums/context-edge-type';

export interface ContextRelation {
  fromNodeId: string;
  contextNodeId: string;
  relationType: ContextEdgeType;
  vehicleId: string;
  observedAt?: string;
  context?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
