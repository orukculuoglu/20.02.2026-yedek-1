import { IndexInput } from '../domain/input/schemas/index-input';
import { IndexSubjectType } from '../domain/enums/index-subject-type';
import { RefType } from '../domain/input/enums/ref-type';
import { RelationType } from '../domain/input/enums/relation-type';
import { EvidenceType } from '../domain/input/enums/evidence-type';
import { IndexInputValidator } from '../domain/input/index-input-validator';

/**
 * Example: IndexInput for a Vehicle
 * 
 * This input aggregates evidence from the Vehicle Intelligence Graph
 * and prepares it for index calculator consumption.
 * Contains references to graph artifacts, normalized evidence, and calculator-ready features.
 */
export const vehicleInputExample: IndexInput = {
  inputId: 'VEHICLE:vehicle-001:2026-03-14T10:30:00Z',
  subjectType: IndexSubjectType.VEHICLE,
  subjectId: 'vehicle-001',
  observedAt: new Date('2026-03-14T10:30:00Z'),
  validAt: new Date('2026-03-14T00:00:00Z'),
  validFrom: new Date('2026-03-14T00:00:00Z'),
  validTo: new Date('2026-04-14T00:00:00Z'),
  eventCount: 247,
  sourceCount: 5,
  intelligenceCount: 12,
  signalCount: 6,
  trustScore: 0.89,
  provenanceScore: 0.91,
  dataQualityScore: 0.88,
  refs: [
    {
      refType: RefType.GRAPH_SIGNAL,
      refId: 'signal-001-maintenance-risk',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
      metadata: { signalType: 'MAINTENANCE_RISK_SIGNAL', severity: 'HIGH' },
    },
    {
      refType: RefType.GRAPH_SIGNAL,
      refId: 'signal-002-anomaly-detection',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:15:00Z'),
      metadata: { signalType: 'ANOMALY_DETECTION_SIGNAL', anomalyCount: 3 },
    },
    {
      refType: RefType.GRAPH_INDEX,
      refId: 'index-001-engine-health',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.CONTEXTUAL,
      observedAt: new Date('2026-03-14T09:00:00Z'),
    },
    {
      refType: RefType.DATA_SOURCE,
      refId: 'source-obd2-001',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
    },
    {
      refType: RefType.DATA_SOURCE,
      refId: 'source-service-history',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.CONTEXTUAL,
      observedAt: new Date('2026-03-10T16:00:00Z'),
    },
  ],
  evidence: [
    {
      evidenceType: EvidenceType.MEASUREMENT,
      label: 'Engine Oil Viscosity Index',
      value: 87,
      unit: 'percent-of-baseline',
      confidence: 0.94,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['source-obd2-001'],
      metadata: { sensor: 'oil-quality-indicator', reading: '1.87 cSt' },
    },
    {
      evidenceType: EvidenceType.PATTERN,
      label: 'Repeated Service Delays',
      value: 3,
      unit: 'occurrences',
      confidence: 0.91,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['source-service-history'],
    },
    {
      evidenceType: EvidenceType.SIGNAL,
      label: 'Maintenance Risk Signal Detected',
      value: true,
      confidence: 0.92,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['signal-001-maintenance-risk'],
    },
    {
      evidenceType: EvidenceType.COMPARISON,
      label: 'Reliability vs Fleet Average',
      value: 'above-average',
      confidence: 0.87,
      timestamp: new Date('2026-03-14T10:15:00Z'),
      relatedRefIds: ['index-001-engine-health'],
    },
    {
      evidenceType: EvidenceType.STATUS,
      label: 'Safety System Status',
      value: 'fully-operational',
      confidence: 0.99,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['source-obd2-001'],
    },
  ],
  featureSet: {
    repeatedFailureCount: 3,
    maintenanceDelayDays: 14,
    unresolvedSignalCount: 2,
    sourceDiversity: 0.83,
    eventRecencyScore: 0.92,
    trustWeightedEvidenceScore: 0.88,
    provenanceStrength: 0.90,
    utilizationRate: 0.76,
    entityAgeInDays: 1857,
    customFeatures: {
      'emission-level': 'above-threshold',
      'brake-pad-wear': '65-percent',
      'tire-condition': 'acceptable',
    },
  },
  snapshot: {
    snapshotId: 'snapshot-vehicle-001-20260314',
    capturedAt: new Date('2026-03-14T10:30:00Z'),
    freshnessSeconds: 180,
    temporalCoverage: 'last 30 days',
    stale: false,
    missingDataFlags: [],
    totalDataPoints: 442,
    dataCompletenessPercent: 96,
  },
  metadata: {
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2019,
    region: 'North America',
    maintenanceSchedule: 'standard',
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexInputValidator.validate(vehicleInputExample);
