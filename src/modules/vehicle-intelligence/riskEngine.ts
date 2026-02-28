/**
 * Vehicle Intelligence Module - Risk Engine
 * Calculates risk metrics from vehicle data sources
 */

import type {
  KmHistoryRecord,
  ObdRecord,
  InsuranceRecord,
  DamageRecord,
  ServiceRecord,
} from './types';

/**
 * Utility: Clamp a value to 0-100 range
 */
function clamp100(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Detect odometer anomalies (e.g., rollback or manipulation)
 * Returns true if anomaly detected
 */
export function detectOdometerAnomaly(kmHistory: KmHistoryRecord[]): boolean {
  if (kmHistory.length < 2) return false;

  // Sort by date
  const sorted = [...kmHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Check for km decrease (except minor variations < 500km)
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].km - sorted[i - 1].km;
    if (diff < -500) {
      return true; // Rollback detected
    }
  }

  return false;
}

/**
 * Calculate service gap score
 * 0 = perfect maintenance, 100 = critical gaps
 */
export function calculateServiceGapScore(serviceRecords: ServiceRecord[]): number {
  if (serviceRecords.length === 0) return 80; // No service records = high risk

  // Calculate time gaps between services
  const sorted = [...serviceRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalGapDays = 0;
  let gapCount = 0;

  for (let i = 1; i < sorted.length; i++) {
    const gapDays =
      (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
      (1000 * 60 * 60 * 24);
    totalGapDays += gapDays;
    gapCount++;
  }

  const avgGapDays = gapCount > 0 ? totalGapDays / gapCount : 365;

  // Ideal gap: 6 months = 180 days
  // Score: 0 at 180 days, rises to 100 at 720 days (2 years)
  const gapScore = Math.min(100, Math.max(0, (avgGapDays - 180) / 5.4));

  return clamp100(gapScore);
}

/**
 * Calculate structural risk from damage records (0-100)
 */
export function calculateStructuralRisk(damageRecords: DamageRecord[]): number {
  if (damageRecords.length === 0) return 0;

  let riskScore = 0;

  for (const record of damageRecords) {
    const daysAgo =
      (new Date().getTime() - new Date(record.date).getTime()) / (1000 * 60 * 60 * 24);

    if (record.severity === 'major') {
      // Major damage: 50 points, decays over 2 years
      const decay = Math.max(0, 1 - daysAgo / 730);
      riskScore += 50 * decay;
    } else {
      // Minor damage: 10 points, decays over 1 year
      const decay = Math.max(0, 1 - daysAgo / 365);
      riskScore += 10 * decay;
    }
  }

  return clamp100(riskScore);
}

/**
 * Calculate mechanical risk from OBD fault codes (0-100)
 */
export function calculateMechanicalRisk(obdRecords: ObdRecord[]): number {
  if (obdRecords.length === 0) return 0;

  const now = new Date();
  let riskScore = 0;

  // Group faults by code and age
  const faultMap = new Map<string, number>();

  for (const record of obdRecords) {
    const daysAgo =
      (now.getTime() - new Date(record.date).getTime()) / (1000 * 60 * 60 * 24);
    const code = record.faultCode;

    // Count repeated faults
    faultMap.set(code, (faultMap.get(code) || 0) + 1);
  }

  // Severity mapping for common faults
  const faultSeverity: Record<string, number> = {
    P0300: 25, // Random misfire - moderate
    P0101: 20, // Mass air flow - moderate
    P0420: 30, // Catalyst efficiency - high
    P0172: 15, // System too rich - low-moderate
    P0401: 20, // EGR flow - moderate
    P0011: 25, // Cam timing - moderate
  };

  for (const [code, count] of faultMap.entries()) {
    const baseSeverity = faultSeverity[code] || 20;
    const multiplier = Math.min(3, count); // Cap multiplier at 3x (repeated faults)
    riskScore += baseSeverity * multiplier;
  }

  return clamp100(riskScore);
}

/**
 * Calculate insurance risk from insurance records (0-100)
 */
export function calculateInsuranceRisk(insuranceRecords: InsuranceRecord[]): number {
  if (insuranceRecords.length === 0) return 20; // Unknown = low baseline risk

  let riskScore = 0;
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Count recent claims and lapses
  let recentClaims = 0;
  let recentLapses = 0;

  for (const record of insuranceRecords) {
    const recordDate = new Date(record.date);

    if (recordDate >= oneYearAgo) {
      if (record.type === 'claim') {
        recentClaims++;
        riskScore += 30; // Each claim: 30 points
      }
      if (record.type === 'lapse') {
        recentLapses++;
        riskScore += 40; // Each lapse: 40 points
      }
    }
  }

  // Recent inquiries suggest shopping around (slightly negative signal)
  const recentInquiries = insuranceRecords.filter(
    (r) => new Date(r.date) >= oneYearAgo && r.type === 'inquiry'
  ).length;
  if (recentInquiries > 2) {
    riskScore += 15;
  }

  return clamp100(riskScore);
}

/**
 * Calculate trust index from all metrics (0-100)
 * 100 = fully trustworthy, 0 = highly suspicious
 */
export function calculateTrustIndex(
  odometerAnomaly: boolean,
  serviceGapScore: number,
  damageCount: number,
  claimCount: number
): number {
  let trustScore = 100;

  // Odometer anomaly: massive red flag (-50 points)
  if (odometerAnomaly) trustScore -= 50;

  // Service gaps: (-20 to 0 depending on score)
  trustScore -= serviceGapScore * 0.2;

  // Multiple damage records: (-10 per record, capped at -30)
  trustScore -= Math.min(30, damageCount * 10);

  // Multiple insurance claims: (-15 per claim, capped at -40)
  trustScore -= Math.min(40, claimCount * 15);

  return clamp100(trustScore);
}

/**
 * Calculate reliability index from mechanical/service factors (0-100)
 */
export function calculateReliabilityIndex(
  mechanicalRisk: number,
  serviceGapScore: number,
  faultCodeCount: number,
  recentServiceCount: number
): number {
  let reliabilityScore = 100;

  // Mechanical issues: reduces reliability
  reliabilityScore -= mechanicalRisk * 0.5;

  // Service gaps: indicates poor maintenance
  reliabilityScore -= serviceGapScore * 0.3;

  // Fault codes: directly indicate reliability issues
  reliabilityScore -= Math.min(20, faultCodeCount * 5);

  // Recent service history improves score
  reliabilityScore += Math.min(20, recentServiceCount * 3);

  return clamp100(reliabilityScore);
}

/**
 * Calculate maintenance discipline (0-100)
 * 100 = excellent discipline, 0 = poor discipline
 */
export function calculateMaintenanceDiscipline(
  serviceRecords: ServiceRecord[],
  serviceGapScore: number,
  odometerRisk: boolean
): number {
  let disciplineScore = 100;

  // Service count within last 2 years (positive indicator)
  const twoYearsAgo = new Date(new Date().getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
  const recentServices = serviceRecords.filter((r) => new Date(r.date) >= twoYearsAgo).length;

  // Missing service records = poor discipline
  if (serviceRecords.length < 3) {
    disciplineScore -= 40;
  } else if (recentServices === 0) {
    // No services in 2 years
    disciplineScore -= 30;
  } else {
    // Reward consistent maintenance
    disciplineScore += Math.min(20, recentServices * 3);
  }

  // Service gaps directly impact discipline
  disciplineScore -= serviceGapScore * 0.5;

  // Odometer anomalies suggest neglect
  if (odometerRisk) {
    disciplineScore -= 20;
  }

  return clamp100(disciplineScore);
}
