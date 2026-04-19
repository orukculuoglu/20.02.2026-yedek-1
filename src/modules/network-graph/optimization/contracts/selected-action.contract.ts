/**
 * Selected Action Contract
 * Defines an action chosen for final optimization output.
 * Structural-only: no execution, no recommendation, no decision flags.
 * Links back to source feasible action and candidate for full traceability.
 * 
 * SELECTED ACTION SEMANTICS (Phase 3):
 * - Selected means: action passed feasibility evaluation AND was chosen by selection strategy
 * - Selected does NOT mean: execution has occurred or will occur
 * - Selected does NOT mean: recommendation approved or preferred by policy
 * - Selected does NOT mean: carries confidence, priority, or approval
 * - Selected action is a terminal decision state: yes, include this in final output
 * - Selected action is structural: just marks final inclusion, no hidden semantics
 * - Selected action is deterministic: same feasibility + selection = same selection always
 * 
 * DECISION BOUNDARY CLOSURE (Phase 4):
 * - Selected is optimization output ONLY: what the optimizer chose as best under constraints
 * - Selected is NOT approval: no authorization or authorization status
 * - Selected is NOT recommendation: no confidence, priority, or preference semantics
 * - Selected is NOT execution: no runtime application or state mutation
 * - Selected is NOT decision: a later decisioning layer may accept, modify, or reject
 * - Selected is structural: just marks "optimizer chose this" (no hidden business logic)
 * - Optimizer responsibility ends at selection: what happens next is decidioner/executor responsibility
 */

import type { ActionCategory } from "./optimization-action-category";

/**
 * SelectedAction
 * Represents a feasible action chosen for final optimization output.
 * Structural-only: action has been selected from feasible set.
 * Terminal decision state: yes, this action is included in final result.
 * Does not execute or apply the action.
 * Does not carry score, recommendation, priority, or execution state.
 * 
 * Full traceability chain: SelectedAction → SourceFeasibleAction → SourceCandidateAction → OriginalCandidate
 * All intermediate IDs preserved to maintain complete audit trail.
 */
export interface SelectedAction {
  /** Unique identifier for this selected action state (caller-provided from sourceFeasibleActionId) */
  readonly selectedActionId: string;

  /** Reference to source feasible action that was selected (caller-provided) */
  readonly sourceFeasibleActionId: string;

  /** Reference to original candidate action for full traceability (caller-provided) */
  readonly sourceCandidateActionId: string;

  /** Category inherited from candidate action (caller-provided, bounded to ActionCategory) */
  readonly category: ActionCategory;
}

/**
 * Selected action behavior:
 * 
 * SELECTION SEMANTICS:
 * - Selected means: this action was chosen to include in final optimization result
 * - Selected means: this action passed feasibility evaluation and survived selection filtering
 * - Selected means: this action is now part of OptimizationResult.selectedActions
 * - Selected does NOT mean: this action has been or will be executed
 * - Selected does NOT mean: this action is recommended or approved by external policy
 * - Selected does NOT mean: this action carries confidence or priority
 * - Selected does NOT mean: selection is guaranteed to proceed or be implemented
 * 
 * OPTIMIZER VS DECISIONING (Phase 4 - Decision Boundary):
 * - Optimizer responsibility: determine what's best under objective + constraints + strategy (deterministic)
 * - Decisioning responsibility: evaluate business logic, risk, policy, and approve/authorize (later layer)
 * - Executor responsibility: apply decision and mutate runtime state (later layer)
 * - Selected does NOT skip decisioning: optimization output must still be decided upon
 * - Selected is intermediate for decisioning: decidioner may accept/reject/modify
 * - Selected is not final approval: optimization selects what's best technically
 * 
 * STRUCTURAL-ONLY:
 * - Maintains chain of references: selected → feasible → candidate (full traceability)
 * - No implicit execution or application
 * - No score, recommendation, confidence, or decision flags
 * - No approval markers or priority indicators
 * - No execution status or timestamp
 * - Selected action ≠ executed action (execution is separate phase)
 * - All values are caller-provided; no generation or inference
 * 
 * DETERMINISTIC SEMANTICS:
 * - Same feasible action + same selection strategy = same selected action
 * - Selection is deterministic transformation (not probabilistic search)
 * - Selection order is maintained by tieBreak strategy (explicit_order or fifo)
 * - Non-selected feasible actions are not carried in result (only terminal states in result)
 * 
 * NO APPROVAL/DECISION SEMANTICS:
 * - SelectedAction does NOT include approval flags or authorization
 * - SelectedAction does NOT include execution status or timestamp
 * - SelectedAction does NOT include policy outcome fields
 * - SelectedAction does NOT include confidence or recommendation scores
 * - All these belong to decisioning layer (not optimizer responsibility)
 */
