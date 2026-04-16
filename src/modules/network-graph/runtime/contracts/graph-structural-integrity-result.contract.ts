/**
 * Graph Structural Integrity Result Contract
 * Structural carrier for integrity evaluation result.
 * Holds detected issues and explicit severity counts.
 * No health score, no business interpretation, no ranking.
 */

import type { GraphStructuralIntegrityIssue } from "./graph-structural-integrity-issue.contract.ts";

/**
 * GraphStructuralIntegrityResult
 * Minimal carrier for structural integrity evaluation result.
 * Holds explicit list of detected structural defects with severity counts.
 * Does not assign business meaning or operational policy to results.
 * All fields immutable once created.
 */
export interface GraphStructuralIntegrityResult {
  /** Overall structural validity: true if graph contains no ERROR-severity issues, false otherwise */
  readonly isStructurallyValid: boolean;

  /** Array of detected structural integrity issues */
  readonly issues: readonly GraphStructuralIntegrityIssue[];

  /** Total count of detected issues (all severities) */
  readonly issueCount: number;

  /** Count of issues with ERROR severity */
  readonly errorCount: number;

  /** Count of issues with WARNING severity */
  readonly warningCount: number;
}
