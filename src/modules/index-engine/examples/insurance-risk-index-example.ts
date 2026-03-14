import { IndexRecord } from '../domain/schemas/index-record';
import { IndexType } from '../domain/enums/index-type';
import { IndexBand, calculateIndexBand } from '../domain/enums/index-band';
import { IndexSubjectType } from '../domain/enums/index-subject-type';
import { IndexRecordValidator } from '../domain/index-record-validator';

/**
 * Example: INSURANCE_RISK_INDEX for a vehicle
 * 
 * This index quantifies the insurance risk profile of a vehicle based on historical
 * claims data, current safety systems functionality, accident history, and behavioral
 * patterns. Higher scores indicate lower risk.
 */
export const insuranceRiskIndexExample: IndexRecord = {
  indexId: 'INSURANCE_RISK_INDEX:vehicle-002:2026-03-14T10:30:00Z',
  indexType: IndexType.INSURANCE_RISK_INDEX,
  subjectType: IndexSubjectType.VEHICLE,
  subjectId: 'vehicle-002',
  score: 0.82,
  band: calculateIndexBand(0.82),
  confidence: 0.94,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  validAt: new Date('2026-03-14T00:00:00Z'),
  validFrom: new Date('2026-03-14T00:00:00Z'),
  validTo: new Date('2026-06-14T00:00:00Z'),
  explanation: {
    summary: 'Vehicle presents low insurance risk profile. Clean claims history over 5 years with excellent safety system functionality and driver behavior rating.',
    positiveFactors: [
      'Zero claims in last 5 years',
      'Complete functional safety system (ABS, ESC, airbags)',
      'Excellent driver behavior indicators',
      'No accident history in insurance records',
      'Comprehensive maintenance record',
    ],
    negativeFactors: [
      'Vehicle occasionally operates in urban congestion (minor risk factor)',
      'One weather-related incident (not at-fault, 8 years ago)',
    ],
    recommendedActions: [
      'Maintain current safety system functionality',
      'Continue good driving practices',
      'Annual safety inspection recommended',
      'Consider usage-based insurance premium qualification',
    ],
    comparison: '19% lower risk than fleet average for this vehicle class',
    trend: 'Improving - has shown positive trend over 24 months',
    nextReviewDate: new Date('2026-06-14T10:30:00Z'),
  },
  metadata: {
    eventCount: 312,
    sourceCount: 7,
    calculationModel: 'insurance-risk-v3.2',
    region: 'North America',
    vehicleMake: 'Honda',
    vehicleModel: 'Accord',
    vehicleYear: 2018,
    tags: { insuranceClass: 'preferred', driverAge: '45-55', usagePattern: 'commute' },
    dataFreshnessInDays: 1,
    isProvisional: false,
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexRecordValidator.validate(insuranceRiskIndexExample);
