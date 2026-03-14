import { IndexInput } from '../domain/input/schemas/index-input';
import { IndexSubjectType } from '../domain/enums/index-subject-type';
import { RefType } from '../domain/input/enums/ref-type';
import { RelationType } from '../domain/input/enums/relation-type';
import { EvidenceType } from '../domain/input/enums/evidence-type';
import { IndexInputValidator } from '../domain/input/index-input-validator';

/**
 * Example: IndexInput for a Vehicle Fleet
 * 
 * Aggregates fleet-level evidence from the Vehicle Intelligence Graph.
 * Captures operational metrics across multiple vehicles.
 */
export const fleetInputExample: IndexInput = {
  inputId: 'VEHICLE_FLEET:fleet-north-001:2026-03-14T10:30:00Z',
  subjectType: IndexSubjectType.VEHICLE_FLEET,
  subjectId: 'fleet-north-001',
  observedAt: new Date('2026-03-14T10:30:00Z'),
  validAt: new Date('2026-03-14T00:00:00Z'),
  validFrom: new Date('2026-03-14T00:00:00Z'),
  validTo: new Date('2026-03-21T00:00:00Z'),
  eventCount: 892,
  sourceCount: 8,
  intelligenceCount: 45,
  signalCount: 28,
  trustScore: 0.90,
  provenanceScore: 0.92,
  dataQualityScore: 0.89,
  refs: [
    {
      refType: RefType.GRAPH_INDEX,
      refId: 'index-fleet-reliability',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
    },
    {
      refType: RefType.GRAPH_SIGNAL,
      refId: 'signal-fleet-maintenance-bulk',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
      metadata: { vehicleCount: 13, urgency: 'scheduled-maintenance' },
    },
    {
      refType: RefType.GRAPH_NODE,
      refId: 'node-fleet-vehicle-statuses',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
    },
    {
      refType: RefType.DATA_SOURCE,
      refId: 'source-fleet-management-system',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.CONTEXTUAL,
      observedAt: new Date('2026-03-14T10:30:00Z'),
    },
    {
      refType: RefType.DATA_SOURCE,
      refId: 'source-telematics-gateway',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
    },
  ],
  evidence: [
    {
      evidenceType: EvidenceType.MEASUREMENT,
      label: 'Operational Vehicles',
      value: 132,
      unit: 'count',
      confidence: 0.99,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['node-fleet-vehicle-statuses'],
    },
    {
      evidenceType: EvidenceType.MEASUREMENT,
      label: 'Total Fleet Size',
      value: 145,
      unit: 'vehicles',
      confidence: 0.99,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['source-fleet-management-system'],
    },
    {
      evidenceType: EvidenceType.MEASUREMENT,
      label: 'Vehicles in Scheduled Maintenance',
      value: 13,
      unit: 'count',
      confidence: 0.98,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['signal-fleet-maintenance-bulk'],
    },
    {
      evidenceType: EvidenceType.PATTERN,
      label: 'Fleet Readiness Trend',
      value: 'improving',
      confidence: 0.85,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['index-fleet-reliability'],
    },
    {
      evidenceType: EvidenceType.COMPARISON,
      label: 'Readiness vs Regional Average',
      value: '7-percent-above-average',
      confidence: 0.82,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['index-fleet-reliability'],
    },
  ],
  featureSet: {
    unresolvedSignalCount: 8,
    sourceDiversity: 0.92,
    eventRecencyScore: 0.94,
    trustWeightedEvidenceScore: 0.89,
    provenanceStrength: 0.91,
    customFeatures: {
      'operational-readiness': '91-percent',
      'vehicles-critical': '0',
      'vehicles-warning': '3',
      'average-vehicle-age': '4.2-years',
      'fleet-utilization': '89-percent',
    },
  },
  snapshot: {
    snapshotId: 'snapshot-fleet-north-001-20260314',
    capturedAt: new Date('2026-03-14T10:30:00Z'),
    freshnessSeconds: 120,
    temporalCoverage: 'current day (24h)',
    stale: false,
    missingDataFlags: [],
    totalDataPoints: 1247,
    dataCompletenessPercent: 98,
  },
  metadata: {
    fleetClient: 'municipal-services',
    fleetType: 'mixed-duty',
    operatingRegion: 'northern-region',
    averageFleetAge: 4.2,
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexInputValidator.validate(fleetInputExample);
