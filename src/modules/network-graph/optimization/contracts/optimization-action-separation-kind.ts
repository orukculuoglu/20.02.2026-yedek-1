/**
 * Action Separation Kind
 * Explicit vocabulary for action rejection reasons.
 * Used in rejected action contracts to indicate bounded rejection causes.
 * No implicit inference, no hidden semantics.
 */

/**
 * RejectionKind
 * Bounded vocabulary for reasons a candidate action is rejected.
 * Currently only "feasibility_violated" - a candidate failed explicit feasibility boundaries.
 * No implicit inference, no hidden policy override semantics.
 * Caller explicitly marks rejection kind when creating RejectedCandidateAction.
 */
export type RejectionKind = "feasibility_violated";
