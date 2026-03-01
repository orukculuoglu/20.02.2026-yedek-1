/**
 * Vehicle Intelligence Module - OBD Intelligence Analyzer
 * Analyzes OBD fault codes for category, severity, and repeating patterns
 */

import type { ObdRecord } from './types';

export type ObdCategory = 'engine' | 'transmission' | 'emission' | 'electrical' | 'brake' | 'other';

export interface ObdIntelligence {
  totalFaultCount: number; // Total OBD records
  uniqueFaultCodes: number; // Unique fault codes
  categoryBreakdown: Record<ObdCategory, number>; // Count per category
  highestSeverity: 'low' | 'medium' | 'high'; // Overall severity
  repeatedFaults: string[]; // Fault codes appearing multiple times
  severityScore: number; // 0-100 risk scale
}

/**
 * Categorize OBD fault code by prefix
 */
function categorizeObdCode(faultCode: string): ObdCategory {
  if (!faultCode || faultCode.length < 2) return 'other';

  const prefix = faultCode.substring(0, 1).toUpperCase();
  const secondChar = faultCode.substring(1, 2).toUpperCase();

  // P0xxx (Powertrain) - typically engine/transmission
  if (prefix === 'P' && faultCode.substring(0, 3) === 'P0x') {
    return 'engine';
  }

  // P1xxx (Powertrain) - typically transmission/emission
  if (prefix === 'P' && faultCode.substring(0, 3) === 'P1x') {
    return 'transmission';
  }

  // P2xxx, P3xxx (Emissions)
  if (prefix === 'P' && (faultCode.substring(0, 3) === 'P2x' || faultCode.substring(0, 3) === 'P3x')) {
    return 'emission';
  }

  // Cxxxx (Chassis) - typically brake
  if (prefix === 'C') {
    return 'brake';
  }

  // Uxxxx (Network) - typically electrical
  if (prefix === 'U') {
    return 'electrical';
  }

  // Bxxxx (Body) - other
  if (prefix === 'B') {
    return 'other';
  }

  return 'other';
}

/**
 * Analyze OBD records for intelligence: categories, severity, repeated faults
 */
export function analyzeObdIntelligence(obdRecords: ObdRecord[]): ObdIntelligence {
  const totalFaultCount = obdRecords.length;

  // If no faults, return minimal analysis
  if (totalFaultCount === 0) {
    return {
      totalFaultCount: 0,
      uniqueFaultCodes: 0,
      categoryBreakdown: {
        engine: 0,
        transmission: 0,
        emission: 0,
        electrical: 0,
        brake: 0,
        other: 0,
      },
      highestSeverity: 'low',
      repeatedFaults: [],
      severityScore: 0,
    };
  }

  // Initialize category breakdown
  const categoryBreakdown: Record<ObdCategory, number> = {
    engine: 0,
    transmission: 0,
    emission: 0,
    electrical: 0,
    brake: 0,
    other: 0,
  };

  // Count fault codes and track repeats
  const faultCodeCounts: Record<string, number> = {};
  const uniqueFaultCodes = new Set<string>();

  for (const record of obdRecords) {
    const code = record.faultCode.toUpperCase();
    uniqueFaultCodes.add(code);

    // Count occurrences
    faultCodeCounts[code] = (faultCodeCounts[code] || 0) + 1;

    // Categorize and count
    const category = categorizeObdCode(code);
    categoryBreakdown[category]++;
  }

  // Find repeated faults (appearing > 1 time)
  const repeatedFaults = Object.entries(faultCodeCounts)
    .filter(([_, count]) => count > 1)
    .map(([code, _]) => code);

  // ========== DETERMINE SEVERITY ==========
  let highestSeverity: 'low' | 'medium' | 'high' = 'low';

  // Critical categories with repeats = HIGH
  if (
    repeatedFaults.length > 0 &&
    (categoryBreakdown.engine > 0 || categoryBreakdown.transmission > 0)
  ) {
    highestSeverity = 'high';
  }
  // Multiple categories = MEDIUM
  else if (
    Object.values(categoryBreakdown).filter((count) => count > 0).length > 1
  ) {
    highestSeverity = 'medium';
  }
  // Any fault in critical categories = MEDIUM
  else if (categoryBreakdown.engine > 1 || categoryBreakdown.transmission > 0) {
    highestSeverity = 'medium';
  }
  // Otherwise LOW for minor faults
  else {
    highestSeverity = 'low';
  }

  // ========== CALCULATE SEVERITY SCORE ==========
  let severityScore = 0;

  // Base: 10 points per fault
  severityScore = Math.min(50, totalFaultCount * 10);

  // Add points for repeated faults
  if (repeatedFaults.length > 0) {
    severityScore += 20;
  }

  // Add points for high severity
  if (highestSeverity === 'high') {
    severityScore += 30;
  } else if (highestSeverity === 'medium') {
    severityScore += 15;
  }

  // Bonus points for multiple categories (indicates complexity)
  const categoryCount = Object.values(categoryBreakdown).filter((count) => count > 0).length;
  severityScore += (categoryCount - 1) * 5;

  return {
    totalFaultCount,
    uniqueFaultCodes: uniqueFaultCodes.size,
    categoryBreakdown,
    highestSeverity,
    repeatedFaults,
    severityScore: Math.min(100, Math.max(0, severityScore)),
  };
}
