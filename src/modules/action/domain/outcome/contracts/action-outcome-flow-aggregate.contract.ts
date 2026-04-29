import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { SuccessActionOutcome } from "./success-action-outcome.contract.js";
import type { FailedActionOutcome } from "./failed-action-outcome.contract.js";
import type { BlockedActionOutcome } from "./blocked-action-outcome.contract.js";
import type { ExpiredActionOutcome } from "./expired-action-outcome.contract.js";
import type { CancelledActionOutcome } from "./cancelled-action-outcome.contract.js";
import type { DeferredActionOutcome } from "./deferred-action-outcome.contract.js";
import type { ActionLifecycleSummary } from "./action-lifecycle-summary.contract.js";

/**
 * ActionOutcomeFlowBase - Shared base structure for all action outcome flow outcomes
 * Base structure containing outcome flow result identity and summary.
 */
interface ActionOutcomeFlowBase {
  /**
   * Unique identifier for this outcome flow result
   */
  readonly outcomeFlowId: string;

  /**
   * Optional collection of successful action outcomes
   */
  readonly successActionOutcomes?: ReadonlyArray<SuccessActionOutcome>;

  /**
   * Optional collection of failed action outcomes
   */
  readonly failedActionOutcomes?: ReadonlyArray<FailedActionOutcome>;

  /**
   * Optional collection of blocked action outcomes
   */
  readonly blockedActionOutcomes?: ReadonlyArray<BlockedActionOutcome>;

  /**
   * Optional collection of expired action outcomes
   */
  readonly expiredActionOutcomes?: ReadonlyArray<ExpiredActionOutcome>;

  /**
   * Optional collection of cancelled action outcomes
   */
  readonly cancelledActionOutcomes?: ReadonlyArray<CancelledActionOutcome>;

  /**
   * Optional collection of deferred action outcomes
   */
  readonly deferredActionOutcomes?: ReadonlyArray<DeferredActionOutcome>;

  /**
   * Structural summary of outcome flow distribution
   */
  readonly lifecycleSummary: ActionLifecycleSummary;
}

/**
 * ActionOutcomeFlow - Structural aggregation of action outcome flow outcomes
 * Pure structural aggregation of success, failed, blocked, expired, cancelled, and deferred outcomes.
 * Outcome-complete: at least one outcome collection must be present and non-empty.
 * Union-based: ensures type-level guarantee that at least one outcome type exists.
 * No execution, dispatch, retry, scheduling, or audit semantics.
 */
export type ActionOutcomeFlow = 
  | (ActionOutcomeFlowBase & { readonly successActionOutcomes: NonEmptyReadonlyArray<SuccessActionOutcome> })
  | (ActionOutcomeFlowBase & { readonly failedActionOutcomes: NonEmptyReadonlyArray<FailedActionOutcome> })
  | (ActionOutcomeFlowBase & { readonly blockedActionOutcomes: NonEmptyReadonlyArray<BlockedActionOutcome> })
  | (ActionOutcomeFlowBase & { readonly expiredActionOutcomes: NonEmptyReadonlyArray<ExpiredActionOutcome> })
  | (ActionOutcomeFlowBase & { readonly cancelledActionOutcomes: NonEmptyReadonlyArray<CancelledActionOutcome> })
  | (ActionOutcomeFlowBase & { readonly deferredActionOutcomes: NonEmptyReadonlyArray<DeferredActionOutcome> });
