import { IndexRecord } from '../domain/schemas/index-record';
import { IndexType } from '../domain/enums/index-type';
import { IndexBand, calculateIndexBand } from '../domain/enums/index-band';
import { IndexSubjectType } from '../domain/enums/index-subject-type';
import { IndexRecordValidator } from '../domain/index-record-validator';

/**
 * Example: OPERATIONAL_READINESS_INDEX for a vehicle fleet
 * 
 * This index measures the operational readiness of a fleet - the percentage of
 * vehicles in the fleet that are available and capable of safe operation without
 * critical maintenance or repairs.
 */
export const operationalReadinessIndexExample: IndexRecord = {
  indexId: 'OPERATIONAL_READINESS_INDEX:fleet-north-001:2026-03-14T10:30:00Z',
  indexType: IndexType.OPERATIONAL_READINESS_INDEX,
  subjectType: IndexSubjectType.VEHICLE_FLEET,
  subjectId: 'fleet-north-001',
  score: 0.91,
  band: calculateIndexBand(0.91),
  confidence: 0.89,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  validAt: new Date('2026-03-14T00:00:00Z'),
  validFrom: new Date('2026-03-14T00:00:00Z'),
  validTo: new Date('2026-03-21T00:00:00Z'),
  explanation: {
    summary: 'Fleet operational readiness is excellent. 91% of 145 vehicles are operational and ready for deployment. 13 vehicles in scheduled maintenance, 0 vehicles out of service due to critical issues.',
    positiveFactors: [
      '132 of 145 vehicles (91%) immediately operational',
      'All critical safety systems verified',
      'Average fleet age is 4.2 years (optimal for this fleet type)',
      'Planned maintenance schedule being followed',
      'No critical failures reported in last 72 hours',
    ],
    negativeFactors: [
      '13 vehicles in scheduled maintenance windows',
      '1 vehicle has minor brake system recommendation (non-critical)',
      '2 vehicles have tire wear approaching minimum safe threshold',
    ],
    recommendedActions: [
      'Expedite tire replacement for 2 flagged vehicles if high-utilization scheduled',
      'Continue current scheduled maintenance program',
      'Verify brake inspection on flagged vehicle within 5 days',
      'Maintain current deployment allocation',
    ],
    comparison: '7 percentage points above regional fleet average of 84%',
    trend: 'Stable - maintained between 88-94% over last month',
    nextReviewDate: new Date('2026-03-21T10:30:00Z'),
  },
  metadata: {
    eventCount: 892,
    sourceCount: 8,
    calculationModel: 'fleet-readiness-v2.5',
    region: 'North America - Northern Zone',
    tags: { 
      fleetClient: 'municipal-services', 
      fleetType: 'mixed-duty',
      operatingRegion: 'northern-region',
      maintenanceDue: '13-vehicles',
    },
    dataFreshnessInDays: 0,
    isProvisional: false,
    caveats: [
      'Scheduled maintenance windows may temporarily reduce availability',
      'Extreme weather may impact vehicle deployment capability',
    ],
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexRecordValidator.validate(operationalReadinessIndexExample);
