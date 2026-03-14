import { ProvenanceRelation } from '../domain/provenance/provenance-relation';
import { ProvenanceEdgeType } from '../domain/enums/provenance-edge-type';

export const validProvenanceRelation: ProvenanceRelation = {
  fromNodeId: 'source:obd2:session:001',
  toNodeId: 'node:vehicle:12345:root',
  relationType: ProvenanceEdgeType.INGESTED_FROM_SOURCE,
  vehicleId: 'vehicle:12345',
  observedAt: '2026-03-14T10:30:00Z',
  processRef: 'ingestion:obd2:batch:a1b2c3d4',
  recordRef: 'record:obd2:12345:001',
  context: {
    source: 'OBD2_DEVICE',
    protocol: 'ISO_9141_2',
  },
  metadata: {
    ingestionMethod: 'real_time_stream',
    dataQuality: 'high',
  },
};

export const invalidProvenanceRelation: ProvenanceRelation = {
  fromNodeId: 'node:intelligence:analysis:789',
  toNodeId: 'node:intelligence:analysis:789',
  relationType: ProvenanceEdgeType.LINKED_TO_LINEAGE,
  vehicleId: 'vehicle:54321',
};
