import { IndexRecord } from '../domain/schemas/index-record';
import { IndexType } from '../domain/enums/index-type';
import { IndexBand, calculateIndexBand } from '../domain/enums/index-band';
import { IndexSubjectType } from '../domain/enums/index-subject-type';
import { IndexRecordValidator } from '../domain/index-record-validator';

/**
 * Example: RELIABILITY_INDEX for a vehicle
 * 
 * This index measures the probability that vehicle components will operate
 * without failure over a specified period. Based on historical data, current
 * condition, and predictive signals from the Vehicle Intelligence Graph.
 */
export const reliabilityIndexExample: IndexRecord = {
  indexId: 'RELIABILITY_INDEX:vehicle-001:2026-03-14T10:30:00Z',
  indexType: IndexType.RELIABILITY_INDEX,
  subjectType: IndexSubjectType.VEHICLE,
  subjectId: 'vehicle-001',
  score: 0.78,
  band: calculateIndexBand(0.78),
  confidence: 0.91,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  validAt: new Date('2026-03-14T00:00:00Z'),
  validFrom: new Date('2026-03-14T00:00:00Z'),
  validTo: new Date('2026-04-14T00:00:00Z'),
  explanation: {
    summary: 'Vehicle demonstrates good overall reliability with stable component performance patterns. Engine system shows 94% uptime over the last 30 days.',
    positiveFactors: [
      'Engine shows consistent performance metrics',
      'Transmission fluid levels stable',
      'No recurring fault codes detected in last 60 days',
      'Brake system functioning normally',
    ],
    negativeFactors: [
      'Battery voltage exhibits seasonal degradation',
      'Secondary electrical system shows intermittent alerts',
    ],
    recommendedActions: [
      'Plan battery inspection within 30 days',
      'Continue monitoring secondary electrical system',
      'Schedule routine service according to maintenance plan',
    ],
    comparison: 'Above fleet average of 0.72 for this vehicle model/year',
    trend: 'Stable over last 90 days',
    nextReviewDate: new Date('2026-04-14T10:30:00Z'),
  },
  metadata: {
    eventCount: 247,
    sourceCount: 5,
    calculationModel: 'vehicle-reliability-v2.1',
    region: 'North America',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleYear: 2019,
    tags: { productionBatch: 'TYO-2019-Q3', maintenanceSchedule: 'standard' },
    dataFreshnessInDays: 2,
    isProvisional: false,
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexRecordValidator.validate(reliabilityIndexExample);
