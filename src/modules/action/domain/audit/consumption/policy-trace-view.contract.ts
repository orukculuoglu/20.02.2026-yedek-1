import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * PolicyTraceView - Consumption view for policy traces
 * Reference-only: no trace traversal or replay logic
 */
export interface PolicyTraceView {
  readonly policyTraceReferenceId: string;
  readonly policyReferenceIds?: NonEmptyReadonlyArray<string>;
}
