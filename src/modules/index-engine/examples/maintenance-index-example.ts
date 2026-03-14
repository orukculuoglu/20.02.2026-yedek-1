import { IndexRecord } from '../domain/schemas/index-record';
import { IndexType } from '../domain/enums/index-type';
import { IndexBand, calculateIndexBand } from '../domain/enums/index-band';
import { IndexSubjectType } from '../domain/enums/index-subject-type';
import { IndexRecordValidator } from '../domain/index-record-validator';

/**
 * Example: MAINTENANCE_INDEX for a vehicle component
 * 
 * This index measures the urgency and priority of maintenance actions required
 * for a specific component. Derived from service indicators, age, usage patterns,
 * and predictive deterioration signals.
 */
export const maintenanceIndexExample: IndexRecord = {
  indexId: 'MAINTENANCE_INDEX:component-eng-001:2026-03-14T10:30:00Z',
  indexType: IndexType.MAINTENANCE_INDEX,
  subjectType: IndexSubjectType.VEHICLE_COMPONENT,
  subjectId: 'component-eng-001',
  score: 0.35,
  band: calculateIndexBand(0.35),
  confidence: 0.87,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  validAt: new Date('2026-03-14T00:00:00Z'),
  validFrom: new Date('2026-03-14T00:00:00Z'),
  validTo: new Date('2026-03-28T00:00:00Z'),
  explanation: {
    summary: 'Engine oil change service is urgently required. Oil analysis shows viscosity degradation and elevated wear metal concentrations indicating end-of-service-life approaching.',
    positiveFactors: [
      'Oil filter condition acceptable',
      'Engine block temperature under control',
    ],
    negativeFactors: [
      'Oil viscosity index degraded by 23% from baseline',
      'Iron wear metals elevated to 87 ppm (warning threshold 100 ppm)',
      'Service interval exceeded by 2,340 miles',
      'Last oil change was 187 days ago (interval: 180 days)',
    ],
    recommendedActions: [
      'Schedule oil and filter change within 5 days',
      'Inspect engine filter head for contamination',
      'Run diagnostic on fuel injectors',
      'Document maintenance action in service record',
    ],
    comparison: '47% more urgent than fleet average for this component type',
    trend: 'Degrading - progressed from MEDIUM band 14 days ago',
    nextReviewDate: new Date('2026-03-21T10:30:00Z'),
  },
  metadata: {
    eventCount: 84,
    sourceCount: 3,
    calculationModel: 'component-maintenance-v1.8',
    region: 'North America',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2019,
    tags: { componentType: 'engine', maintenanceType: 'oil-service', likelyIssue: 'oil-degradation' },
    dataFreshnessInDays: 0,
    isProvisional: false,
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexRecordValidator.validate(maintenanceIndexExample);
