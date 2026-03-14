/**
 * Composite comparison utilities
 * Deterministic comparison of two composite records with explainability
 */

import { CompositeRecord } from './composite.types';

/**
 * Result of comparing two composite records
 * Provides delta analysis and change detection
 */
export interface CompositeComparisonResult {
  /**
   * Whether both composites are of the same type
   */
  sameType: boolean;

  /**
   * Change in score (second - first)
   * Positive = improvement, Negative = degradation
   */
  scoreDelta: number;

  /**
   * Change in confidence (second - first)
   */
  confidenceDelta: number;

  /**
   * Whether band classification changed
   */
  bandChanged: boolean;

  /**
   * Whether severity level changed
   */
  severityChanged: boolean;

  /**
   * Direction of score movement
   */
  direction: 'UP' | 'DOWN' | 'STABLE';

  /**
   * Optional explanation of the major delta
   */
  explanationDeltaSummary?: string;
}

/**
 * Compare two composite records deterministically
 * Supports delta analysis and change detection for same-type composites
 *
 * @param a - First composite (baseline/previous)
 * @param b - Second composite (current/new)
 * @returns Comparison result with deltas and change indicators
 */
export function compareCompositeRecords(
  a: CompositeRecord,
  b: CompositeRecord,
): CompositeComparisonResult {
  // Type compatibility check
  const sameType = a.compositeType === b.compositeType;

  // Non-comparable result if types differ
  if (!sameType) {
    return {
      sameType: false,
      scoreDelta: 0,
      confidenceDelta: 0,
      bandChanged: false,
      severityChanged: false,
      direction: 'STABLE',
      explanationDeltaSummary: 'NON_COMPARABLE_COMPOSITE_TYPES',
    };
  }

  // Score and confidence deltas
  const scoreDelta = b.normalizedScore - a.normalizedScore;
  const confidenceDelta = b.confidence - a.confidence;

  // Band and severity change detection
  const bandChanged = a.band?.label !== b.band?.label;
  const severityChanged = a.severity !== b.severity;

  // Direction determination (no threshold logic)
  let direction: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (scoreDelta > 0) {
    direction = 'UP';
  } else if (scoreDelta < 0) {
    direction = 'DOWN';
  }

  return {
    sameType,
    scoreDelta,
    confidenceDelta,
    bandChanged,
    severityChanged,
    direction,
  };
}
