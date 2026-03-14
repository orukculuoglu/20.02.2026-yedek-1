import { TrustRelation } from '../domain/trust/trust-relation';
import { TrustEdgeType } from '../domain/enums/trust-edge-type';

export const validTrustRelation: TrustRelation = {
  fromNodeId: 'intelligence:diagnostic:engine:analysis:001',
  toNodeId: 'event:diagnostic:engine:fault:p0101',
  relationType: TrustEdgeType.SUPPORTED_BY_EVIDENCE,
  vehicleId: 'vehicle:12345',
  observedAt: '2026-03-14T10:45:00Z',
  confidenceScore: 0.92,
  evidenceRef: 'evidence:obd2:diagnostic:p0101:session:001',
  context: {
    diagnosticMethod: 'OBD2_SCAN',
    faultCode: 'P0101',
  },
  metadata: {
    trustLevel: 'HIGH',
    sourceReliability: 'CERTIFIED',
  },
};

export const invalidTrustRelation: TrustRelation = {
  fromNodeId: 'node:analysis:results:batch:456',
  toNodeId: 'node:analysis:results:batch:456',
  relationType: TrustEdgeType.CONTRADICTED_BY_NODE,
  vehicleId: 'vehicle:67890',
};
