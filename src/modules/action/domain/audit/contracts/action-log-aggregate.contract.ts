import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { ActionLogEventRecord } from "./action-log-event-record.contract.js";

/**
 * ActionLog - Structural aggregation of action audit log event records
 * Pure structural aggregation ensuring at least one log event record is present.
 * Non-hollow: guarantees non-empty collection at type level.
 * No storage, query, replay, timeline, or analytics semantics.
 */
export interface ActionLog {
  /**
   * Unique identifier for this action audit log
   */
  readonly actionLogId: string;

  /**
   * Non-empty collection of action audit log event records
   * Guaranteed to contain at least one log event entry.
   */
  readonly logEventRecords: NonEmptyReadonlyArray<ActionLogEventRecord>;

  /**
   * Optional reference identifier to the top-level action or entity this log belongs to
   */
  readonly entityId?: string;
}
