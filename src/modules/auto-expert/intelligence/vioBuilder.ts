/**
 * Auto-Expert Module - VIO Builder
 * Converts VehicleAggregate to VehicleIntelligenceOutput (VIO)
 */

import type { VehicleAggregate } from '../../vehicle-intelligence/types';
import type {
  VehicleIntelligenceOutput,
  IntelligenceIndex,
  IntelligenceSignal,
  PartLifeFeatures,
} from './vioTypes';
import {
  VIO_THRESHOLDS,
  computeConfidence,
  evidenceSourcesFromCounts,
} from './vioConfig';
import {
  computeCoverageScore,
  computeConsistencyScore,
  computeOverallConfidence,
  buildConfidenceExplanation,
  adjustConfidenceForTrustIndex,
  adjustConfidenceForMechanicalRisk,
  adjustConfidenceForInsuranceRisk,
  adjustSignalConfidence,
} from './confidenceEngine';

/**
 * Calculate average daily km from km history
 */
function calculateAvgDailyKm(kmHistory: Array<{ date: string; km: number }>): number {
  if (kmHistory.length < 2) return 0;

  // Sort by date
  const sorted = [...kmHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstRecord = sorted[0];
  const lastRecord = sorted[sorted.length - 1];

  const firstDate = new Date(firstRecord.date);
  const lastDate = new Date(lastRecord.date);

  const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff <= 0) return 0;

  const kmDiff = lastRecord.km - firstRecord.km;
  return Math.round(kmDiff / daysDiff);
}

/**
 * Calculate km progression slope (km per month approx)
 */
function calculateKmSlope(kmHistory: Array<{ date: string; km: number }>): number {
  if (kmHistory.length < 2) return 0;

  const sorted = [...kmHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstRecord = sorted[0];
  const lastRecord = sorted[sorted.length - 1];

  const firstDate = new Date(firstRecord.date);
  const lastDate = new Date(lastRecord.date);

  const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 +
    (lastDate.getMonth() - firstDate.getMonth());

  if (monthsDiff <= 0) return 0;

  const kmDiff = lastRecord.km - firstRecord.km;
  return Math.round(kmDiff / monthsDiff);
}

/**
 * Extract part life features from vehicle aggregate
 */
function extractPartLifeFeatures(aggregate: VehicleAggregate): PartLifeFeatures {
  const { kmHistory, serviceRecords, obdRecords } = aggregate.dataSources;

  // Get last service record
  let lastServiceKm: number | undefined;
  let lastServiceDate: string | undefined;

  if (serviceRecords.length > 0) {
    const lastService = serviceRecords[serviceRecords.length - 1];
    lastServiceDate = lastService.date;
    // Try to find km at that date in history
    const serviceDate = new Date(lastService.date);
    const closestRecord = kmHistory
      .filter((r) => new Date(r.date) <= serviceDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (closestRecord) {
      lastServiceKm = closestRecord.km;
    }
  }

  return {
    avgDailyKm: calculateAvgDailyKm(kmHistory),
    kmSlope: calculateKmSlope(kmHistory),
    lastServiceKm,
    lastServiceDate,
    obdFaultCount: obdRecords.length,
  };
}

/**
 * Build intelligence indexes array from derived metrics
 */
function buildIndexes(aggregate: VehicleAggregate): IntelligenceIndex[] {
  const { derived, indexes, dataSources } = aggregate;

  // Compute confidence scores from coverage and consistency
  const coverageScore = computeCoverageScore(aggregate);
  const consistencyScore = computeConsistencyScore(aggregate);
  const baseConfidence = computeOverallConfidence(aggregate);
  const confidenceExplanation = buildConfidenceExplanation({
    coverageScore,
    consistencyScore,
    aggregate,
  });

  // Evidence sources available
  const evidenceSources = evidenceSourcesFromCounts({
    kmHistoryCount: dataSources.kmHistory.length,
    serviceCount: dataSources.serviceRecords.length,
    obdCount: dataSources.obdRecords.length,
    insuranceCount: dataSources.insuranceRecords.length,
    damageCount: dataSources.damageRecords.length,
  });

  return [
    {
      key: 'trustIndex',
      label: 'Trust Index',
      value: indexes.trustIndex,
      scale: '0-100',
      confidence:
        derived.kmIntelligence.rollbackSeverity > 60
          ? Math.max(30, adjustConfidenceForTrustIndex(baseConfidence, dataSources.kmHistory.length) - 20)
          : adjustConfidenceForTrustIndex(baseConfidence, dataSources.kmHistory.length),
      evidenceSources,
      meta: {
        confidenceReason:
          derived.kmIntelligence.rollbackSeverity > 60
            ? `Coverage: ${coverageScore}%, Consistency: ${consistencyScore}% | Trust reduced: Rollback severity ${derived.kmIntelligence.rollbackSeverity}/100`
            : `Coverage: ${coverageScore}%, Consistency: ${consistencyScore}% | Trust relies on KM history`,
      },
    },
    {
      key: 'reliabilityIndex',
      label: 'Reliability Index',
      value: indexes.reliabilityIndex,
      scale: '0-100',
      confidence: baseConfidence,
      evidenceSources,
      meta: {
        confidenceReason: `Coverage: ${coverageScore}%, Consistency: ${consistencyScore}% | Multi-source analysis`,
      },
    },
    {
      key: 'maintenanceDiscipline',
      label: 'Maintenance Discipline',
      value: indexes.maintenanceDiscipline,
      scale: '0-100',
      confidence: Math.max(30, baseConfidence - (dataSources.serviceRecords.length === 0 ? 20 : 0)),
      evidenceSources,
      meta: {
        confidenceReason: `Coverage: ${coverageScore}%, Consistency: ${consistencyScore}% | Service record count: ${dataSources.serviceRecords.length}`,
      },
    },
    {
      key: 'structuralRisk',
      label: 'Structural Risk',
      value: derived.structuralRisk,
      scale: '0-100',
      confidence: Math.max(30, baseConfidence - (dataSources.damageRecords.length === 0 ? 15 : 0)),
      evidenceSources,
      meta: {
        confidenceReason: `Coverage: ${coverageScore}%, Consistency: ${consistencyScore}% | Damage records: ${dataSources.damageRecords.length}`,
      },
    },
    {
      key: 'mechanicalRisk',
      label: 'Mechanical Risk',
      value: derived.mechanicalRisk,
      scale: '0-100',
      confidence: adjustConfidenceForMechanicalRisk(baseConfidence, dataSources.obdRecords.length),
      evidenceSources,
      meta: {
        confidenceReason: `Coverage: ${coverageScore}%, Consistency: ${consistencyScore}% | OBD records: ${dataSources.obdRecords.length}`,
      },
    },
    {
      key: 'insuranceRisk',
      label: 'Insurance Risk',
      value: derived.insuranceRisk,
      scale: '0-100',
      confidence: adjustConfidenceForInsuranceRisk(baseConfidence, dataSources.insuranceRecords.length),
      evidenceSources,
      meta: {
        confidenceReason: `Coverage: ${coverageScore}%, Consistency: ${consistencyScore}% | Insurance records: ${dataSources.insuranceRecords.length}`,
      },
    },
  ];
}

/**
 * Build intelligence signals from derived metrics and data
 */
function buildSignals(aggregate: VehicleAggregate): IntelligenceSignal[] {
  const signals: IntelligenceSignal[] = [];
  const { derived, dataSources } = aggregate;

  // Compute confidence scores
  const coverageScore = computeCoverageScore(aggregate);
  const consistencyScore = computeConsistencyScore(aggregate);
  const baseConfidence = computeOverallConfidence(aggregate);

  // Evidence sources
  const baseEvidenceSources = evidenceSourcesFromCounts({
    kmHistoryCount: dataSources.kmHistory.length,
    serviceCount: dataSources.serviceRecords.length,
    obdCount: dataSources.obdRecords.length,
    insuranceCount: dataSources.insuranceRecords.length,
    damageCount: dataSources.damageRecords.length,
  });

  // ODOMETER ANOMALY
  if (derived.odometerAnomaly) {
    const confidenceValue = adjustSignalConfidence(95, 'high', dataSources.kmHistory.length);
    signals.push({
      code: 'ODOMETER_ANOMALY_DETECTED',
      severity: 'high',
      confidence: confidenceValue,
      evidenceSources: ['km_history'],
      evidenceCount: dataSources.kmHistory.length,
      meta: {
        description: 'Km rollback or manipulation detected',
        confidenceReason: `High confidence anomaly detection with ${dataSources.kmHistory.length} KM records`,
      },
    });
  }

  // KM ROLLBACK DETECTED (with severity classification)
  if (derived.kmIntelligence.hasRollback && derived.kmIntelligence.rollbackSeverity > 0) {
    let rollbackSeverity: 'low' | 'medium' | 'high';
    if (derived.kmIntelligence.rollbackSeverity > 70) {
      rollbackSeverity = 'high';
    } else if (derived.kmIntelligence.rollbackSeverity > 40) {
      rollbackSeverity = 'medium';
    } else {
      rollbackSeverity = 'low';
    }

    const confidenceValue = adjustSignalConfidence(
      baseConfidence,
      rollbackSeverity,
      derived.kmIntelligence.rollbackEvidenceCount + 1
    );

    signals.push({
      code: 'KM_ROLLBACK_DETECTED',
      severity: rollbackSeverity,
      confidence: confidenceValue,
      evidenceSources: ['km_history'],
      evidenceCount: derived.kmIntelligence.rollbackEvidenceCount,
      meta: {
        rollbackSeverity: derived.kmIntelligence.rollbackSeverity,
        evidenceCount: derived.kmIntelligence.rollbackEvidenceCount,
        volatilityScore: derived.kmIntelligence.volatilityScore,
        usageClass: derived.kmIntelligence.usageClass,
        confidenceReason: `Rollback severity: ${derived.kmIntelligence.rollbackSeverity}/100 at ${derived.kmIntelligence.rollbackEvidenceCount} point(s) | Volatility: ${derived.kmIntelligence.volatilityScore}/100 | Usage: ${derived.kmIntelligence.usageClass}`,
      },
    });
  }

  // HIGH STRUCTURAL RISK
  if (derived.structuralRisk > VIO_THRESHOLDS.STRUCTURAL_RISK_HIGH) {
    const confidenceValue = adjustSignalConfidence(baseConfidence, 'high', dataSources.damageRecords.length);
    signals.push({
      code: 'HIGH_STRUCTURAL_RISK',
      severity: 'high',
      confidence: confidenceValue,
      evidenceSources: ['damage_records'],
      evidenceCount: dataSources.damageRecords.length,
      meta: {
        riskValue: derived.structuralRisk,
        damageRecords: dataSources.damageRecords.length,
        confidenceReason: `Coverage: ${coverageScore}%, Evidence: ${dataSources.damageRecords.length} damage records`,
      },
    });
  } else if (derived.structuralRisk > VIO_THRESHOLDS.STRUCTURAL_RISK_MODERATE) {
    const confidenceValue = adjustSignalConfidence(baseConfidence, 'medium', dataSources.damageRecords.length);
    signals.push({
      code: 'MODERATE_STRUCTURAL_RISK',
      severity: 'medium',
      confidence: confidenceValue,
      evidenceSources: ['damage_records'],
      evidenceCount: dataSources.damageRecords.length,
      meta: {
        riskValue: derived.structuralRisk,
        confidenceReason: `Coverage: ${coverageScore}%, Evidence: ${dataSources.damageRecords.length} damage records`,
      },
    });
  }

  // MECHANICAL RISK
  if (derived.mechanicalRisk > VIO_THRESHOLDS.MECHANICAL_RISK_PRESENT) {
    const confidenceValue = adjustSignalConfidence(baseConfidence, 'medium', dataSources.obdRecords.length);
    signals.push({
      code: 'MECHANICAL_RISK_PRESENT',
      severity: 'medium',
      confidence: confidenceValue,
      evidenceSources: ['obd_records'],
      evidenceCount: dataSources.obdRecords.length,
      meta: {
        riskValue: derived.mechanicalRisk,
        faultCodeCount: dataSources.obdRecords.length,
        confidenceReason: `Coverage: ${coverageScore}%, Evidence: ${dataSources.obdRecords.length} OBD fault codes`,
      },
    });
  }

  // SERVICE GAP
  if (derived.serviceGapScore > VIO_THRESHOLDS.SERVICE_GAP_DETECTED) {
    const confidenceValue = adjustSignalConfidence(
      baseConfidence,
      'medium',
      dataSources.serviceRecords.length + dataSources.kmHistory.length
    );
    signals.push({
      code: 'SERVICE_GAP_DETECTED',
      severity: 'medium',
      confidence: confidenceValue,
      evidenceSources: ['service_records', 'km_history'],
      evidenceCount: dataSources.serviceRecords.length,
      meta: {
        gapScore: derived.serviceGapScore,
        lastServiceCount: dataSources.serviceRecords.length,
        confidenceReason: `Coverage: ${coverageScore}%, Evidence: ${dataSources.serviceRecords.length} service records + KM history`,
      },
    });
  }

  // INSURANCE RISK
  if (derived.insuranceRisk > VIO_THRESHOLDS.INSURANCE_RISK_DETECTED) {
    const claimCount = dataSources.insuranceRecords.filter((r) => r.type === 'claim').length;
    const confidenceValue = adjustSignalConfidence(baseConfidence, 'medium', claimCount);
    signals.push({
      code: 'INSURANCE_RISK_DETECTED',
      severity: 'medium',
      confidence: confidenceValue,
      evidenceSources: ['insurance_records'],
      evidenceCount: claimCount,
      meta: {
        riskValue: derived.insuranceRisk,
        claimCount,
        confidenceReason: `Coverage: ${coverageScore}%, Evidence: ${claimCount} insurance claims`,
      },
    });
  }

  // LOW MAINTENANCE DISCIPLINE
  if (aggregate.indexes.maintenanceDiscipline < VIO_THRESHOLDS.MAINTENANCE_DISCIPLINE_LOW) {
    const confidenceValue = adjustSignalConfidence(
      baseConfidence,
      'medium',
      dataSources.serviceRecords.length + dataSources.kmHistory.length
    );
    signals.push({
      code: 'LOW_MAINTENANCE_DISCIPLINE',
      severity: 'medium',
      confidence: confidenceValue,
      evidenceSources: ['service_records', 'km_history'],
      evidenceCount: dataSources.serviceRecords.length,
      meta: {
        disciplineScore: aggregate.indexes.maintenanceDiscipline,
        confidenceReason: `Coverage: ${coverageScore}%, Consistency: ${consistencyScore}%, Evidence: ${dataSources.serviceRecords.length} service records`,
      },
    });
  }

  return signals;
}

/**
 * Build complete VehicleIntelligenceOutput from VehicleAggregate
 */
export function buildVIO(aggregate: VehicleAggregate): VehicleIntelligenceOutput {
  try {
    console.log(`[VIOBuilder] Building VIO for ${aggregate.plate}`);

    const vio: VehicleIntelligenceOutput = {
      vehicleId: aggregate.vehicleId,
      version: '1.0',
      schemaVersion: '1.1',
      generatedAt: new Date().toISOString(),

      indexes: buildIndexes(aggregate),
      signals: buildSignals(aggregate),
      partLifeFeatures: extractPartLifeFeatures(aggregate),

      summary: aggregate.insightSummary,
    };

    console.log(
      `[VIOBuilder] ✓ VIO created: ${vio.indexes.length} indexes, ${vio.signals.length} signals (schemaVersion: ${vio.schemaVersion})`
    );
    return vio;
  } catch (err) {
    console.error('[VIOBuilder] Error building VIO:', err);
    throw err;
  }
}
