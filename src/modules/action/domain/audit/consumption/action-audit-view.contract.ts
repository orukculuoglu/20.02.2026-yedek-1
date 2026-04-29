import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * ActionAuditView - Consumption view for action log records
 * Reference-only: no query/filter/sort logic
 */
export interface ActionAuditView {
  readonly actionLogReferenceId: string;
  readonly eventRecordReferenceIds?: NonEmptyReadonlyArray<string>;
}
