import { ProvenanceEdgeType } from '../enums/provenance-edge-type';

export interface ProvenanceRelation {
  fromNodeId: string;
  toNodeId: string;
  relationType: ProvenanceEdgeType;
  vehicleId: string;
  observedAt?: string;
  processRef?: string;
  recordRef?: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
