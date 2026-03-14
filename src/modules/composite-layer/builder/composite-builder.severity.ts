/**
 * Severity resolution for composite records
 * Deterministic severity assignment based on score and confidence
 */

import { CompositeSeverity } from '../core/composite.severity';
import type { CompositeType } from '../core/composite.enums';

/**
 * Resolve severity for composite record
 *
 * Deterministic baseline rule set:
 * - normalizedScore < 0.20 => INFO
 * - normalizedScore < 0.40 => WATCH
 * - normalizedScore < 0.60 => ELEVATED
 * - normalizedScore < 0.80 => HIGH
 * - otherwise => CRITICAL
 *
 * Confidence adjustment:
 * - if confidence < 0.50, severity may not exceed HIGH
 *
 * @param compositeType - The composite type
 * @param normalizedScore - The normalized score (0.0 - 1.0)
 * @param confidence - Confidence level (0.0 - 1.0)
 * @returns The resolved composite severity
 */
export function resolveCompositeSeverityForRecord(
  compositeType: CompositeType,
  normalizedScore: number,
  confidence: number,
): CompositeSeverity {
  // Determine baseline severity from score
  let baseSeverity: CompositeSeverity;

  if (normalizedScore < 0.20) {
    baseSeverity = CompositeSeverity.INFO;
  } else if (normalizedScore < 0.40) {
    baseSeverity = CompositeSeverity.WATCH;
  } else if (normalizedScore < 0.60) {
    baseSeverity = CompositeSeverity.ELEVATED;
  } else if (normalizedScore < 0.80) {
    baseSeverity = CompositeSeverity.HIGH;
  } else {
    baseSeverity = CompositeSeverity.CRITICAL;
  }

  // Apply confidence adjustment deterministically
  if (confidence < 0.50) {
    // Low confidence: cap severity at HIGH
    const severityOrder: CompositeSeverity[] = [
      CompositeSeverity.INFO,
      CompositeSeverity.WATCH,
      CompositeSeverity.ELEVATED,
      CompositeSeverity.HIGH,
      CompositeSeverity.CRITICAL,
    ];

    const baseSeverityIndex = severityOrder.indexOf(baseSeverity);
    const maxIndex = 3; // HIGH is at index 3

    if (baseSeverityIndex > maxIndex) {
      return severityOrder[maxIndex];
    }
  }

  return baseSeverity;
}
