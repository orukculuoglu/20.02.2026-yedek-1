/**
 * Auto-Expert Intelligence Module - VIO Configuration
 * Centralized thresholds, confidence rules, and evidence source mapping
 * Version: 1.1
 */

/**
 * VIO Signal and Index Thresholds
 * Machine-readable configuration for signal generation
 */
export const VIO_THRESHOLDS = {
  // Structural Risk thresholds
  STRUCTURAL_RISK_HIGH: 70,
  STRUCTURAL_RISK_MODERATE: 40,

  // Mechanical Risk thresholds
  MECHANICAL_RISK_PRESENT: 50,

  // Service Gap thresholds
  SERVICE_GAP_DETECTED: 60,

  // Insurance Risk thresholds
  INSURANCE_RISK_DETECTED: 50,

  // Maintenance Discipline thresholds
  MAINTENANCE_DISCIPLINE_LOW: 40,
} as const;

/**
 * Data source identifiers for evidence tracking
 */
export const EVIDENCE_SOURCES = {
  KM_HISTORY: 'km_history',
  OBD_RECORDS: 'obd_records',
  INSURANCE_RECORDS: 'insurance_records',
  DAMAGE_RECORDS: 'damage_records',
  SERVICE_RECORDS: 'service_records',
} as const;

/**
 * Compute confidence score (0-100) based on available data sources
 * More data sources = higher confidence in analysis
 * 
 * Confidence accumulation:
 * - KM History present: +30
 * - Service Records present: +20
 * - OBD Records present: +25
 * - Insurance Records present: +25
 * Total max: 100
 */
export function computeConfidence(input: {
  kmHistoryCount: number;
  serviceCount: number;
  obdCount: number;
  insuranceCount: number;
  damageCount: number;
}): number {
  let confidence = 0;

  // KM History: foundation data (30 pts)
  if (input.kmHistoryCount > 0) {
    confidence += 30;
  }

  // Service Records: maintenance history (20 pts)
  if (input.serviceCount > 0) {
    confidence += 20;
  }

  // OBD Records: mechanical health (25 pts)
  if (input.obdCount > 0) {
    confidence += 25;
  }

  // Insurance Records: risk history (25 pts)
  if (input.insuranceCount > 0) {
    confidence += 25;
  }

  // Damage Records boost (treated as part of structural confidence)
  // Already counted in structural risk calculation

  return Math.min(100, Math.max(0, confidence));
}

/**
 * Extract evidence sources from data counts
 * Returns array of source identifiers that have data point(s)
 */
export function evidenceSourcesFromCounts(input: {
  kmHistoryCount: number;
  serviceCount: number;
  obdCount: number;
  insuranceCount: number;
  damageCount: number;
}): string[] {
  const sources: string[] = [];

  if (input.kmHistoryCount > 0) {
    sources.push(EVIDENCE_SOURCES.KM_HISTORY);
  }
  if (input.serviceCount > 0) {
    sources.push(EVIDENCE_SOURCES.SERVICE_RECORDS);
  }
  if (input.obdCount > 0) {
    sources.push(EVIDENCE_SOURCES.OBD_RECORDS);
  }
  if (input.insuranceCount > 0) {
    sources.push(EVIDENCE_SOURCES.INSURANCE_RECORDS);
  }
  if (input.damageCount > 0) {
    sources.push(EVIDENCE_SOURCES.DAMAGE_RECORDS);
  }

  return sources;
}

/**
 * Get human-readable label for evidence source
 */
export function getLabelForEvidenceSource(source: string): string {
  const labels: Record<string, string> = {
    [EVIDENCE_SOURCES.KM_HISTORY]: 'Km History',
    [EVIDENCE_SOURCES.OBD_RECORDS]: 'OBD Records',
    [EVIDENCE_SOURCES.INSURANCE_RECORDS]: 'Insurance Records',
    [EVIDENCE_SOURCES.DAMAGE_RECORDS]: 'Damage Records',
    [EVIDENCE_SOURCES.SERVICE_RECORDS]: 'Service Records',
  };
  return labels[source] || source;
}
