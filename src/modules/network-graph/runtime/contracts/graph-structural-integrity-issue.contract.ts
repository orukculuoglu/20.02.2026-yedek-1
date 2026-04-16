/**
 * Graph Structural Integrity Issue Contract
 * Structural carrier for a detected integrity issue.
 * Minimal fields: code, severity, message, optional context.
 * No remediation fields, no suggested action fields, no scoring fields.
 */

import type { GraphStructuralIntegrityIssueCode } from "./graph-structural-integrity-issue-code.contract.ts";
import type { GraphStructuralIntegrityIssueSeverity } from "./graph-structural-integrity-issue-severity.contract.ts";

/**
 * GraphStructuralIntegrityIssue
 * Minimal carrier for a structural integrity issue.
 * Records detected structural defect with classification and context.
 * No repair suggestions, no auto-fix hints, no workflow implications.
 * All fields immutable once created.
 */
export interface GraphStructuralIntegrityIssue {
  /** Issue classification code (caller-provided on detection, required) */
  readonly code: GraphStructuralIntegrityIssueCode;

  /** Issue severity (caller-provided on detection, required) */
  readonly severity: GraphStructuralIntegrityIssueSeverity;

  /** Human-readable issue description (caller-provided on detection, required) */
  readonly message: string;

  /** Optional entity identifier related to issue (e.g., the duplicate node ID, the missing node ID) */
  readonly relatedEntityId?: string;

  /** Optional entity type classification for structural context ("node", "edge", or "relation") */
  readonly relatedEntityType?: "node" | "edge" | "relation";
}
