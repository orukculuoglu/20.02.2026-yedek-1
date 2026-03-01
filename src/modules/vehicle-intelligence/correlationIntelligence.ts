/**
 * Vehicle Intelligence Module - Insurance + Damage Correlation Analyzer
 * Detects and scores mismatches between insurance records and damage records
 */

import type { InsuranceRecord, DamageRecord } from './types';

export interface InsuranceDamageCorrelation {
  claimCount: number; // Total insurance claims
  damageCount: number; // Total damage records
  matchedEvents: number; // Min(claimCount, damageCount)
  mismatchType: 'none' | 'claims_without_damage' | 'damage_without_claims'; // Type of mismatch detected
  correlationScore: number; // 0-100 risk scale
}

/**
 * Analyze correlation between insurance claims and damage records
 * Detects suspicious patterns like claims without corresponding damage or vice versa
 */
export function analyzeInsuranceDamageCorrelation(
  insuranceRecords: InsuranceRecord[],
  damageRecords: DamageRecord[]
): InsuranceDamageCorrelation {
  // Count claims (insurance events)
  const claimCount = insuranceRecords.filter((r) => r.type === 'claim').length;

  // Count damage events
  const damageCount = damageRecords.length;

  // Calculate matched events (minimum of both)
  const matchedEvents = claimCount > 0 && damageCount > 0 ? Math.min(claimCount, damageCount) : 0;

  // Determine mismatch type
  let mismatchType: 'none' | 'claims_without_damage' | 'damage_without_claims' = 'none';

  if (claimCount > damageCount) {
    mismatchType = 'claims_without_damage';
  } else if (damageCount > claimCount) {
    mismatchType = 'damage_without_claims';
  }

  // Calculate correlation score
  // Base: difference between counts * 10
  // Penalty: +20 if mismatch exists
  let correlationScore = Math.abs(claimCount - damageCount) * 10;

  if (mismatchType !== 'none') {
    correlationScore += 20;
  }

  // Clamp to 0-100
  correlationScore = Math.min(100, Math.max(0, correlationScore));

  return {
    claimCount,
    damageCount,
    matchedEvents,
    mismatchType,
    correlationScore,
  };
}
