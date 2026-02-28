/**
 * Vehicle Intelligence Module - KM Intelligence
 * Advanced analysis of odometer patterns, rollback severity, volatility, and usage classification
 */

import type { KmHistoryRecord } from './types';

/**
 * Rollback severity analysis result
 */
export interface RollbackAnalysis {
  hasRollback: boolean;
  severity: number; // 0-100 (0=no rollback, 100=complete reversal)
  evidenceCount: number; // Number of rollback points detected
}

/**
 * Detect rollback severity
 * Analyzes km history to detect and quantify odometer rollbacks
 *
 * Severity calculation:
 * - Proportional to total rollback delta vs total mileage span
 * - Multiple rollback points increase evidence count
 * - Example: rollback of 5000km in 100000km history = 5% severity = 5/100
 */
export function detectRollbackSeverity(kmHistory: KmHistoryRecord[]): RollbackAnalysis {
  if (kmHistory.length < 2) {
    return {
      hasRollback: false,
      severity: 0,
      evidenceCount: 0,
    };
  }

  // Sort by date
  const sorted = [...kmHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalRollbackDelta = 0;
  let rollbackPointCount = 0;

  // Find all rollback points
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].km - sorted[i - 1].km;
    if (diff < -500) {
      // Significant rollback
      totalRollbackDelta += Math.abs(diff);
      rollbackPointCount++;
    }
  }

  // Calculate severity
  let severity = 0;
  if (totalRollbackDelta > 0 && sorted.length >= 2) {
    const firstKm = sorted[0].km;
    const lastKm = sorted[sorted.length - 1].km;
    const totalMileageSpan = Math.max(lastKm, firstKm) - Math.min(lastKm, firstKm);

    if (totalMileageSpan > 0) {
      // Severity = proportion of rollback delta to total mileage span
      severity = Math.min(100, Math.round((totalRollbackDelta / totalMileageSpan) * 100));
    }
  }

  return {
    hasRollback: rollbackPointCount > 0,
    severity,
    evidenceCount: rollbackPointCount,
  };
}

/**
 * Calculate KM volatility score
 * Measures consistency of km progression over time
 *
 * Logic:
 * - Compute daily/monthly progression differences
 * - Large inconsistent jumps increase volatility
 * - Stable linear increase = low volatility (0-25)
 * - Moderate variations = medium volatility (25-70)
 * - Erratic progression = high volatility (70-100)
 */
export function calculateKmVolatility(kmHistory: KmHistoryRecord[]): number {
  if (kmHistory.length < 3) {
    return 0; // Not enough data
  }

  // Sort by date
  const sorted = [...kmHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate daily km increments
  const dailyIncrements: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const daysDiff = (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 0) {
      const dailyKm = (sorted[i].km - sorted[i - 1].km) / daysDiff;
      if (dailyKm >= 0) {
        // Only count positive increments (ignore rollbacks)
        dailyIncrements.push(dailyKm);
      }
    }
  }

  if (dailyIncrements.length < 2) {
    return 0;
  }

  // Calculate average daily km
  const avgDailyKm = dailyIncrements.reduce((a, b) => a + b, 0) / dailyIncrements.length;

  // Calculate standard deviation of increments
  const variance = dailyIncrements.reduce((sum, km) => sum + Math.pow(km - avgDailyKm, 2), 0) / dailyIncrements.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation: stdDev / mean (normalized to 0-100)
  let volatility = 0;
  if (avgDailyKm > 0) {
    const coeffVar = stdDev / avgDailyKm;
    // Map coefficient of variation to 0-100 scale
    // 0.1 -> 10%, 0.5 -> 50%, 1.0 -> 100%
    volatility = Math.min(100, Math.round(coeffVar * 100));
  }

  return volatility;
}

/**
 * Classify usage intensity based on average daily km
 * - 'low': < 20 km/day (city car, occasional use)
 * - 'normal': 20-70 km/day (regular commute)
 * - 'high': > 70 km/day (commercial/long distance)
 */
export function classifyUsage(avgDailyKm: number): 'low' | 'normal' | 'high' {
  if (avgDailyKm < 20) {
    return 'low';
  }
  if (avgDailyKm > 70) {
    return 'high';
  }
  return 'normal';
}

/**
 * Calculate average daily km from km history
 * Helper function used by classifyUsage
 */
export function calculateAvgDailyKm(kmHistory: KmHistoryRecord[]): number {
  if (kmHistory.length < 2) {
    return 0;
  }

  const sorted = [...kmHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstDate = new Date(sorted[0].date).getTime();
  const lastDate = new Date(sorted[sorted.length - 1].date).getTime();
  const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

  if (daysDiff <= 0) {
    return 0;
  }

  const kmDiff = sorted[sorted.length - 1].km - sorted[0].km;
  const avgDailyKm = kmDiff / daysDiff;

  return Math.max(0, avgDailyKm); // Return 0 if negative (shouldn't happen with valid data)
}
