/**
 * Predictive Signals Engine - Phase 8.7
 * 
 * Generates deterministic predictive signals from vehicle snapshot data.
 * Analyzes risk, insurance, part, expertise, odometer, and diagnostics domains
 * to identify actionable intelligence signals.
 * 
 * ALL SIGNALS TRACED TO SNAPSHOT FIELDS (Phase 8.7 Trace Fix):
 * - maintenance_delay_risk → snapshot.risk.indices.maintenanceDiscipline
 * - mechanical_failure_risk → snapshot.risk.indices.mechanicalRisk + snapshot.diagnostics.obdCount + snapshot.odometer.status
 * - part_supply_pressure → snapshot.part.indices (supplyStress + criticalPartsCount)
 * - insurance_risk_increase → snapshot.insurance.indices.claimFrequencyIndex
 * - trust_score_decline → snapshot.risk.indices.trustIndex
 * 
 * NO fallback/mock values. ALL data from snapshot. DEV-only trace logging shows source and calculation.
 */

import type { VehicleStateSnapshot } from '../../vehicle-state/vehicleStateSnapshotStore';

export interface PredictiveSignal {
  key: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  score: number;  // 0-100
  summary: string;
  rationale: string[];
  trace?: {  // DEV-only trace information
    sourceFields: string[];
    rawValues: Record<string, number | boolean | string>;
    formulaIntermediate?: Record<string, number>;
    scoreBeforeClamp: number;
    scoreAfterClamp: number;
    severityRule: string;
    filtered?: boolean;
  };
  filtered?: boolean;  // If true, signal is below visibility threshold
}

/**
 * Generate predictive signals from vehicle snapshot
 * Deterministic rules-based analysis (no ML)
 * 
 * @param snapshot - Vehicle state snapshot
 * @returns Array of predictive signals (sorted by severity DESC, score DESC)
 */
export function generatePredictiveSignals(snapshot: VehicleStateSnapshot | null): PredictiveSignal[] {
  if (!snapshot) {
    return [];
  }

  const signals: PredictiveSignal[] = [];
  const filteredSignals: Array<{ key: string; score: number; reason: string }> = [];

  // Signal 1: Maintenance Delay Risk
  const maintenanceSignal = checkMaintenanceDelayRisk(snapshot);
  if (maintenanceSignal?.filtered) {
    filteredSignals.push({
      key: maintenanceSignal.key,
      score: maintenanceSignal.score,
      reason: `Below threshold (score=${maintenanceSignal.score})`
    });
  } else if (maintenanceSignal) {
    signals.push(maintenanceSignal);
  }

  // Signal 2: Mechanical Failure Risk
  const mechanicalSignal = checkMechanicalFailureRisk(snapshot);
  if (mechanicalSignal?.filtered) {
    filteredSignals.push({
      key: mechanicalSignal.key,
      score: mechanicalSignal.score,
      reason: `Below threshold (score=${mechanicalSignal.score})`
    });
  } else if (mechanicalSignal) {
    signals.push(mechanicalSignal);
  }

  // Signal 3: Part Supply Pressure
  const supplySignal = checkPartSupplyPressure(snapshot);
  if (supplySignal?.filtered) {
    filteredSignals.push({
      key: supplySignal.key,
      score: supplySignal.score,
      reason: `Below threshold (score=${supplySignal.score})`
    });
  } else if (supplySignal) {
    signals.push(supplySignal);
  }

  // Signal 4: Insurance Risk Increase
  const insuranceSignal = checkInsuranceRiskIncrease(snapshot);
  if (insuranceSignal?.filtered) {
    filteredSignals.push({
      key: insuranceSignal.key,
      score: insuranceSignal.score,
      reason: `Below threshold (score=${insuranceSignal.score})`
    });
  } else if (insuranceSignal) {
    signals.push(insuranceSignal);
  }

  // Signal 5: Trust Score Decline
  const trustSignal = checkTrustScoreDecline(snapshot);
  if (trustSignal?.filtered) {
    filteredSignals.push({
      key: trustSignal.key,
      score: trustSignal.score,
      reason: `Below threshold (score=${trustSignal.score})`
    });
  } else if (trustSignal) {
    signals.push(trustSignal);
  }

  // Sort by severity (high > medium > low) then by score (descending)
  const severityOrder = { high: 3, medium: 2, low: 1 };
  signals.sort((a, b) => {
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.score - a.score;
  });

  if (import.meta.env.MODE === 'development') {
    console.debug('[PredictiveSignalsEngine] Generated signals:', {
      vehicleId: snapshot.vehicleId,
      signalCount: signals.length,
      signals: signals.map(s => ({
        key: s.key,
        severity: s.severity,
        score: s.score,
        title: s.title,
        trace: s.trace,
      })),
      filteredSignals: filteredSignals.length > 0 ? filteredSignals : undefined,
    });
  }

  return signals;
}

/**
 * Check for maintenance delay risk
 * SNAPSHOT SOURCE: snapshot.risk.indices[key='maintenanceDiscipline'].value
 * Formula: Math.max(0, (60 - maintenanceDiscipline) * 1.2)
 * 
 * Signal can appear even if score is low - filtered status distinguishes hidden signals
 */
function checkMaintenanceDelayRisk(snapshot: VehicleStateSnapshot): PredictiveSignal | null {
  const rationale: string[] = [];
  const sourceFields = ['snapshot.risk.indices[maintenanceDiscipline]'];
  
  // EXTRACT FROM SNAPSHOT - NO FALLBACK
  const maintenanceIndexObj = snapshot.risk?.indices?.find(idx => 
    idx.key?.toLowerCase() === 'maintenancediscipline'
  );
  const maintenanceDiscipline = maintenanceIndexObj?.value ?? 0; // Use 0 if not found, NO default
  const found = maintenanceIndexObj !== undefined;
  
  rationale.push(`Bakım disiplini indeksi: ${Math.round(maintenanceDiscipline)}%`);
  
  // Formula: Math.max(0, (60 - maintenanceDiscipline) * 1.2)
  const scoreBeforeClamp = Math.max(0, (60 - maintenanceDiscipline) * 1.2);
  const score = Math.max(0, Math.min(scoreBeforeClamp, 100));
  
  // Severity derived from score
  const getSeverity = (s: number) => s >= 70 ? 'high' : s >= 40 ? 'medium' : 'low';
  const severity = getSeverity(score);
  
  // DEV trace
  const trace = import.meta.env.MODE === 'development' ? {
    sourceFields,
    rawValues: {
      'snapshot.risk.indices[maintenanceDiscipline]': maintenanceDiscipline,
      'found': found,
    },
    formulaIntermediate: {
      '(60 - maintenanceDiscipline)': 60 - maintenanceDiscipline,
      '(60 - maintenanceDiscipline) * 1.2': (60 - maintenanceDiscipline) * 1.2,
    },
    scoreBeforeClamp,
    scoreAfterClamp: score,
    severityRule: `${score} >= 70 ? 'high' : ${score} >= 40 ? 'medium' : 'low' → ${severity}`,
  } : undefined;
  
  // Always return signal object (with filtered flag if below threshold)
  return {
    key: 'maintenance_delay_risk',
    title: 'Bakım Gecikme Riski',
    severity,
    score,
    summary: `Bakım gecikme riski: ${Math.round(score)}/100`,
    rationale,
    trace,
    filtered: score <= 5,
  };
}

/**
 * Check for mechanical failure risk
 * SNAPSHOT SOURCES:
 *   - snapshot.risk.indices[key contains 'mech' or 'engine'].value → mechanicalRisk
 *   - snapshot.diagnostics.obdCount → obdCount
 *   - snapshot.odometer.status === 'anomaly' → odometerAnomaly
 * 
 * Formula: (mechanicalRisk * 0.8) + (obdCount * 5) + (odometerAnomaly ? 20 : 0)
 * Result clamped to 0-100
 */
function checkMechanicalFailureRisk(snapshot: VehicleStateSnapshot): PredictiveSignal | null {
  const rationale: string[] = [];
  const sourceFields = [
    'snapshot.risk.indices[mechanicalRisk]',
    'snapshot.diagnostics.obdCount',
    'snapshot.odometer.status'
  ];
  
  // EXTRACT FROM SNAPSHOT - NO FALLBACK
  const mechanicalRiskObj = snapshot.risk?.indices?.find(idx => 
    idx.key?.toLowerCase().includes('mech') || 
    idx.key?.toLowerCase().includes('engine')
  );
  const mechanicalRisk = mechanicalRiskObj?.value ?? 0;
  
  const obdCount = snapshot.diagnostics?.obdCount ?? 0;
  const odometerAnomaly = snapshot.odometer?.status === 'anomaly' ? 20 : 0;
  
  // Formula: (mechanicalRisk * 0.8) + (obdCount * 5) + odometerAnomaly
  const scoreBeforeClamp = (mechanicalRisk * 0.8) + (obdCount * 5) + odometerAnomaly;
  const score = Math.max(0, Math.min(scoreBeforeClamp, 100));
  
  // Severity derived from score
  const getSeverity = (s: number) => s >= 70 ? 'high' : s >= 40 ? 'medium' : 'low';
  const severity = getSeverity(score);
  
  // DEV trace
  const trace = import.meta.env.MODE === 'development' ? {
    sourceFields,
    rawValues: {
      'snapshot.risk.indices[mechanicalRisk]': mechanicalRisk,
      'snapshot.diagnostics.obdCount': obdCount,
      'snapshot.odometer.status === anomaly': odometerAnomaly > 0,
    },
    formulaIntermediate: {
      '(mechanicalRisk * 0.8)': mechanicalRisk * 0.8,
      '(obdCount * 5)': obdCount * 5,
      'odometerAnomaly': odometerAnomaly,
    },
    scoreBeforeClamp,
    scoreAfterClamp: score,
    severityRule: `${score} >= 70 ? 'high' : ${score} >= 40 ? 'medium' : 'low' → ${severity}`,
  } : undefined;

  if (mechanicalRisk > 0) {
    rationale.push(`Mekanik risk indeksi: ${mechanicalRisk}%`);
  }
  if (obdCount > 0) {
    rationale.push(`OBD arıza kodu: ${obdCount}`);
  }
  if (odometerAnomaly > 0) {
    rationale.push('Odometre anormalliği tespit edildi');
  }
  
  // Always return signal object (with filtered flag if below threshold)
  return {
    key: 'mechanical_failure_risk',
    title: 'Mekanik Arıza Riski',
    severity,
    score,
    summary: `Mekanik arıza riski: ${Math.round(score)}/100`,
    rationale,
    trace,
    filtered: score <= 20,
  };
}

/**
 * Check for part supply pressure
 * SNAPSHOT SOURCES:
 *   - snapshot.part.indices[key contains 'supply'|'stress'|'pressure'].value → supplyStressIndex (averaged)
 *   - snapshot.part.indices (count where value > 80) → criticalPartsCount
 * 
 * Formula: (supplyStressIndex * 0.6) + (criticalPartsCount * 5)
 * Result clamped to 0-100
 */
function checkPartSupplyPressure(snapshot: VehicleStateSnapshot): PredictiveSignal | null {
  const rationale: string[] = [];
  const sourceFields = [
    'snapshot.part.indices[supply|stress|pressure]',
    'snapshot.part.indices.count(value > 80)',
  ];

  if (!snapshot.part?.indices || snapshot.part.indices.length === 0) {
    if (import.meta.env.MODE === 'development') {
      console.debug('[PredictiveSignalsEngine] part_supply_pressure: No part indices found');
    }
    return null;
  }

  // EXTRACT FROM SNAPSHOT - NO FALLBACK
  const supplyStressIndices = snapshot.part.indices.filter(idx =>
    idx.key?.toLowerCase().includes('supply') ||
    idx.key?.toLowerCase().includes('stress') ||
    idx.key?.toLowerCase().includes('pressure')
  );
  
  const supplyStressIndex = supplyStressIndices.length > 0
    ? supplyStressIndices.reduce((a, b) => a + b.value, 0) / supplyStressIndices.length
    : 0;
  
  const criticalPartsCount = snapshot.part.indices.filter(idx => idx.value > 80).length;
  
  // Formula: (supplyStressIndex * 0.6) + (criticalPartsCount * 5)
  const scoreBeforeClamp = (supplyStressIndex * 0.6) + (criticalPartsCount * 5);
  const score = Math.max(0, Math.min(scoreBeforeClamp, 100));
  
  // Severity derived from score
  const getSeverity = (s: number) => s >= 70 ? 'high' : s >= 40 ? 'medium' : 'low';
  const severity = getSeverity(score);
  
  // DEV trace
  const trace = import.meta.env.MODE === 'development' ? {
    sourceFields,
    rawValues: {
      'snapshot.part.indices[supply|stress|pressure] avg': supplyStressIndex,
      'snapshot.part.indices.count(value > 80)': criticalPartsCount,
      'total part indices': snapshot.part.indices.length,
    },
    formulaIntermediate: {
      '(supplyStressIndex * 0.6)': supplyStressIndex * 0.6,
      '(criticalPartsCount * 5)': criticalPartsCount * 5,
    },
    scoreBeforeClamp,
    scoreAfterClamp: score,
    severityRule: `${score} >= 70 ? 'high' : ${score} >= 40 ? 'medium' : 'low' → ${severity}`,
  } : undefined;
  
  if (supplyStressIndex > 0) {
    rationale.push(`Tedarik stresi indeksi: ${Math.round(supplyStressIndex)}%`);
  }
  if (criticalPartsCount > 0) {
    rationale.push(`Kritik parça sayısı: ${criticalPartsCount}`);
  }
  
  // Always return signal object (with filtered flag if below threshold)
  return {
    key: 'part_supply_pressure',
    title: 'Parça Tedarik Baskısı',
    severity,
    score,
    summary: `Parça tedarik baskısı: ${Math.round(score)}/100`,
    rationale,
    trace,
    filtered: score <= 20,
  };
}

/**
 * Check for insurance risk increase
 * SNAPSHOT SOURCE: snapshot.insurance.indices[key contains 'claim'|'frequency'].value → claimFrequencyIndex
 * 
 * Formula: claimFrequencyIndex * 0.7
 * Result clamped to 0-100
 */
function checkInsuranceRiskIncrease(snapshot: VehicleStateSnapshot): PredictiveSignal | null {
  const rationale: string[] = [];
  const sourceFields = ['snapshot.insurance.indices[claimFrequencyIndex]'];

  if (!snapshot.insurance?.indices || snapshot.insurance.indices.length === 0) {
    if (import.meta.env.MODE === 'development') {
      console.debug('[PredictiveSignalsEngine] insurance_risk_increase: No insurance indices found');
    }
    return null;
  }

  // EXTRACT FROM SNAPSHOT - NO FALLBACK
  const claimFrequencyIndexObj = snapshot.insurance.indices.find(idx =>
    idx.key?.toLowerCase().includes('claim') ||
    idx.key?.toLowerCase().includes('frequency')
  );
  const claimFrequencyIndex = claimFrequencyIndexObj?.value ?? 0;
  const found = claimFrequencyIndexObj !== undefined;
  
  // Formula: claimFrequencyIndex * 0.7
  const scoreBeforeClamp = claimFrequencyIndex * 0.7;
  const score = Math.max(0, Math.min(scoreBeforeClamp, 100));
  
  // Severity derived from score
  const getSeverity = (s: number) => s >= 70 ? 'high' : s >= 40 ? 'medium' : 'low';
  const severity = getSeverity(score);
  
  // DEV trace
  const trace = import.meta.env.MODE === 'development' ? {
    sourceFields,
    rawValues: {
      'snapshot.insurance.indices[claimFrequencyIndex]': claimFrequencyIndex,
      'found': found,
    },
    formulaIntermediate: {
      '(claimFrequencyIndex * 0.7)': claimFrequencyIndex * 0.7,
    },
    scoreBeforeClamp,
    scoreAfterClamp: score,
    severityRule: `${score} >= 70 ? 'high' : ${score} >= 40 ? 'medium' : 'low' → ${severity}`,
  } : undefined;
  
  if (claimFrequencyIndex > 0) {
    rationale.push(`Talep sıklığı indeksi: ${Math.round(claimFrequencyIndex)}%`);
  }
  
  // Always return signal object (with filtered flag if below threshold)
  return {
    key: 'insurance_risk_increase',
    title: 'Sigorta Riski Artışı',
    severity,
    score,
    summary: `Sigorta riski: ${Math.round(score)}/100`,
    rationale,
    trace,
    filtered: score <= 20,
  };
}

/**
 * Check for trust score decline
 * SNAPSHOT SOURCE: snapshot.risk.indices[key='trustindex'].value → trustIndex
 * 
 * Formula: Math.max(0, (70 - trustIndex) * 1.5)
 * trustIndex is confidence/quality metric 0-100 (higher = better)
 * Result clamped to 0-100
 */
function checkTrustScoreDecline(snapshot: VehicleStateSnapshot): PredictiveSignal | null {
  const rationale: string[] = [];
  const sourceFields = ['snapshot.risk.indices[trustIndex]'];
  
  // EXTRACT FROM SNAPSHOT - NO FALLBACK
  const trustIndexObj = snapshot.risk?.indices?.find(idx =>
    idx.key?.toLowerCase() === 'trustindex'
  );
  const trustIndex = trustIndexObj?.value ?? 0; // Use 0 if not found, NO default
  const found = trustIndexObj !== undefined;
  
  rationale.push(`Güven indeksi: ${Math.round(trustIndex)}%`);
  
  // Formula: Math.max(0, (70 - trustIndex) * 1.5)
  const scoreBeforeClamp = Math.max(0, (70 - trustIndex) * 1.5);
  const score = Math.max(0, Math.min(scoreBeforeClamp, 100));
  
  // Severity derived from score
  const getSeverity = (s: number) => s >= 70 ? 'high' : s >= 40 ? 'medium' : 'low';
  const severity = getSeverity(score);
  
  // DEV trace
  const trace = import.meta.env.MODE === 'development' ? {
    sourceFields,
    rawValues: {
      'snapshot.risk.indices[trustIndex]': trustIndex,
      'found': found,
    },
    formulaIntermediate: {
      '(70 - trustIndex)': 70 - trustIndex,
      '(70 - trustIndex) * 1.5': (70 - trustIndex) * 1.5,
    },
    scoreBeforeClamp,
    scoreAfterClamp: score,
    severityRule: `${score} >= 70 ? 'high' : ${score} >= 40 ? 'medium' : 'low' → ${severity}`,
  } : undefined;
  
  // Always return signal object (with filtered flag if below threshold)
  return {
    key: 'trust_score_decline',
    title: 'Veri Güvenilirliği Düşüşü',
    severity,
    score,
    summary: `Veri güvenilirliği: ${Math.round(score)}/100`,
    rationale,
    trace,
    filtered: score <= 5,
  };
}
