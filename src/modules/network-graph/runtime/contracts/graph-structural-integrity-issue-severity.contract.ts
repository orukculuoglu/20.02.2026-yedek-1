/**
 * Graph Structural Integrity Issue Severity Vocabulary
 * Defines severity levels for structural integrity issues only.
 * Minimal vocabulary: info, warning, error.
 * No scoring meaning, no policy meaning.
 */

/**
 * GraphStructuralIntegrityIssueSeverity
 * Enumeration of severity levels for structural defects.
 * Three-level scale: informational (info), notable (warning), defective (error).
 * Not a health score, not a risk assessment, not a priority ranking.
 */
export enum GraphStructuralIntegrityIssueSeverity {
  /** Info severity: informational structural observation */
  INFO = "info",

  /** Warning severity: notable structural defect */
  WARNING = "warning",

  /** Error severity: critical structural defect */
  ERROR = "error",
}
