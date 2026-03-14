import { IndexRecord } from '../domain/schemas/index-record';
import { IndexType } from '../domain/enums/index-type';
import { IndexBand, calculateIndexBand } from '../domain/enums/index-band';
import { IndexSubjectType } from '../domain/enums/index-subject-type';
import { IndexRecordValidator } from '../domain/index-record-validator';

/**
 * Example: DATA_QUALITY_INDEX for a data source
 * 
 * This index measures the completeness, freshness, and reliability of data coming
 * from a specific data source. Determines the trustworthiness of intelligence
 * generated from that source's data.
 */
export const dataQualityIndexExample: IndexRecord = {
  indexId: 'DATA_QUALITY_INDEX:source-obd2-001:2026-03-14T10:30:00Z',
  indexType: IndexType.DATA_QUALITY_INDEX,
  subjectType: IndexSubjectType.DATA_SOURCE,
  subjectId: 'source-obd2-001',
  score: 0.88,
  band: calculateIndexBand(0.88),
  confidence: 0.93,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  validAt: new Date('2026-03-14T00:00:00Z'),
  validFrom: new Date('2026-03-14T00:00:00Z'),
  validTo: new Date('2026-03-21T00:00:00Z'),
  explanation: {
    summary: 'OBD-II data source demonstrates high quality with excellent data completeness and consistency. 2,847 vehicles reporting, 99.2% uptime, minimal transmission errors.',
    positiveFactors: [
      'Data completeness: 99.1% of expected parameters received',
      'Transmission reliability: 99.7% of transmissions successful',
      'Freshness: Average data age 3.1 minutes (target < 5 minutes)',
      'Consistency: 99.4% data consistency check pass rate',
      'Zero critical schema violations in 30-day period',
    ],
    negativeFactors: [
      'Device connectivity variance on 12 vehicles (0.42% of fleet)',
      'Minor timestamp inconsistency in 0.3% of records (non-critical)',
      'One telemetry module required restart during period',
    ],
    recommendedActions: [
      'Investigate connectivity variance on 12 flagged vehicles',
      'Continue current data validation procedures',
      'Review and confirm timestamp precision standards',
      'Schedule quarterly hardware health check',
    ],
    comparison: 'Above source family average of 0.83 for OBD-II sources',
    trend: 'Improving - has shown +0.06 improvement over last 90 days',
    nextReviewDate: new Date('2026-03-21T10:30:00Z'),
  },
  metadata: {
    eventCount: 1456231,
    sourceCount: 1,
    calculationModel: 'data-quality-assessment-v1.9',
    tags: {
      sourceType: 'obd2-gateway',
      deviceModel: 'telematics-unit-v4',
      hardwareVersion: '4.2.1',
      connectedVehicles: '2847',
    },
    dataFreshnessInDays: 0,
    isProvisional: false,
    caveats: [
      'Quality metrics based on last 30 days of observation',
      'Excludes temporary network outages < 5 minutes',
      'Hardware failures automatically trigger replacement protocol',
    ],
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexRecordValidator.validate(dataQualityIndexExample);
