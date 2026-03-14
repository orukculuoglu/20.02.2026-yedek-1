import { IndexInput } from '../domain/input/schemas/index-input';
import { IndexSubjectType } from '../domain/enums/index-subject-type';
import { RefType } from '../domain/input/enums/ref-type';
import { RelationType } from '../domain/input/enums/relation-type';
import { EvidenceType } from '../domain/input/enums/evidence-type';
import { IndexInputValidator } from '../domain/input/index-input-validator';

/**
 * Example: IndexInput for a Vehicle Component
 * 
 * Focuses on a specific component (e.g., engine, transmission, battery)
 * and aggregates component-specific evidence from the Vehicle Intelligence Graph.
 */
export const componentInputExample: IndexInput = {
  inputId: 'VEHICLE_COMPONENT:component-engine-001:2026-03-14T10:30:00Z',
  subjectType: IndexSubjectType.VEHICLE_COMPONENT,
  subjectId: 'component-engine-001',
  observedAt: new Date('2026-03-14T10:30:00Z'),
  validAt: new Date('2026-03-14T00:00:00Z'),
  validFrom: new Date('2026-03-14T00:00:00Z'),
  validTo: new Date('2026-04-14T00:00:00Z'),
  eventCount: 84,
  sourceCount: 3,
  intelligenceCount: 7,
  signalCount: 2,
  trustScore: 0.87,
  provenanceScore: 0.89,
  dataQualityScore: 0.91,
  refs: [
    {
      refType: RefType.GRAPH_SIGNAL,
      refId: 'signal-engine-anomaly',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
      metadata: { signalType: 'ANOMALY_DETECTION_SIGNAL', anomalyType: 'temperature-spike' },
    },
    {
      refType: RefType.GRAPH_NODE,
      refId: 'node-engine-events',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
    },
    {
      refType: RefType.DATA_SOURCE,
      refId: 'source-obd2-engine',
      sourceModule: 'vehicle-intelligence-graph',
      relationType: RelationType.DIRECT,
      observedAt: new Date('2026-03-14T10:30:00Z'),
    },
  ],
  evidence: [
    {
      evidenceType: EvidenceType.MEASUREMENT,
      label: 'Engine Oil Quality',
      value: 23,
      unit: 'ppm-iron',
      confidence: 0.96,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['source-obd2-engine'],
    },
    {
      evidenceType: EvidenceType.MEASUREMENT,
      label: 'Oil Analysis Viscosity Degradation',
      value: 23,
      unit: 'percent',
      confidence: 0.92,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['source-obd2-engine'],
    },
    {
      evidenceType: EvidenceType.PATTERN,
      label: 'Service Interval Overdue',
      value: 2340,
      unit: 'miles',
      confidence: 0.99,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['source-obd2-engine'],
    },
    {
      evidenceType: EvidenceType.SIGNAL,
      label: 'Engine Temperature Spike Detected',
      value: true,
      confidence: 0.88,
      timestamp: new Date('2026-03-14T10:25:00Z'),
      relatedRefIds: ['signal-engine-anomaly'],
    },
    {
      evidenceType: EvidenceType.EVENT,
      label: 'Last Service Date',
      value: '2025-09-10',
      confidence: 0.99,
      timestamp: new Date('2026-03-14T10:30:00Z'),
      relatedRefIds: ['source-obd2-engine'],
    },
  ],
  featureSet: {
    repeatedFailureCount: 1,
    maintenanceDelayDays: 187,
    unresolvedSignalCount: 1,
    sourceDiversity: 0.67,
    eventRecencyScore: 0.88,
    trustWeightedEvidenceScore: 0.85,
    provenanceStrength: 0.88,
    entityAgeInDays: 2157,
    customFeatures: {
      'oil-viscosity-status': 'degraded',
      'service-urgency': 'high',
      'thermal-stability': 'marginal',
    },
  },
  snapshot: {
    snapshotId: 'snapshot-engine-001-20260314',
    capturedAt: new Date('2026-03-14T10:30:00Z'),
    freshnessSeconds: 300,
    temporalCoverage: 'last 180 days',
    stale: false,
    missingDataFlags: [],
    totalDataPoints: 127,
    dataCompletenessPercent: 94,
  },
  metadata: {
    componentType: 'engine',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2019,
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexInputValidator.validate(componentInputExample);
