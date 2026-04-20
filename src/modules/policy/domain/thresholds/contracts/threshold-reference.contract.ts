/**
 * ThresholdReference - Minimal reference contract for thresholds
 * Pure reference structure with no threshold loading or resolution behavior.
 */
export interface ThresholdReference {
  /**
   * Unique identifier for the referenced threshold
   * No threshold loading or threshold structure resolution included
   */
  readonly thresholdId: string;
}
