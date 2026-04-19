/**
 * Optimization Result Contract
 * Defines the structural output of an optimization process.
 * Structural-only: no runtime optimization, no scoring, no decision logic.
 * Carries selected actions and rejected candidates explicitly.
 * 
 * RESULT BOUNDARY CLOSURE (Phase 3):
 * - Optimizer result surface is now formally closed
 * - Result meaning: collection of terminal action states (selected or rejected)
 * - Result vocabulary: binary distinction between selected and rejected (no intermediate states)
 * - Minimal result doctrine: only final states are carried (no feasible pool, no rankings, no rationales)
 * 
 * TERMINAL STATES (appear in result):
 * - Selected actions: passed feasibility AND chosen by selection strategy (yes decision)
 * - Rejected candidates: FAILED feasibility evaluation (no decision)
 * 
 * NON-TERMINAL STATES (do NOT appear in result):
 * - Non-selected feasible actions: passed feasibility BUT not chosen by selection (stay in runtime context)
 * - Non-selected feasible is intermediate state, not terminal state
 * - Non-selected feasible should NOT be confused with rejected
 * - MODEL A FORMALIZED: Rejected = infeasible only, Non-selected feasible = separate category outside result
 * 
 * WHAT RESULT DOES NOT CARRY:
 * - Non-selected feasible actions (remain in runtime context, never reached result)
 * - Ranking order (selection detail, deferred to audit)
 * - Constraint match summary (audit detail, not result)
 * - Rationale (audit detail, not result)
 * - Result is NOT recommendation: no confidence, priority, or approval flags
 * - Result is NOT execution: no status, timestamp, or side effects
 * - Result is NOT analytics: no scoring, metrics, or derived properties
 * - Deterministic result doctrine: same optimization outcome means same result always
 * 
 * DECISION BOUNDARY CLOSURE (Phase 4):
 * - OptimizationResult is optimizer output ONLY: what optimizer computed as best under constraints
 * - OptimizationResult is NOT approval/authorization: later decisioning layer decides what to authorize
 * - OptimizationResult is NOT recommendation: no confidence, priority, or preference
 * - OptimizationResult is NOT execution: no runtime mutation or state change
 * - OptimizationResult is NOT final decision: decisioner may accept, modify, or reject
 * - OptimizationResult is structural carrier: just optimization outcome (deterministic, no bias)
 * - Workflow: Optimization → Decisioning → Execution (three separate layers)
 * - What result explicitly does NOT carry (decisioning/execution layer concerns):
 *   - Approval status: decisioning layer concern
 *   - Authorization tokens: decisioning layer concern
 *   - Execution callbacks: execution layer concern
 *   - Policy evaluation: decisioning layer concern
 *   - Confidence/probability: decisioning layer concern
 *   - Risk assessment: decisioning layer concern
 * - No semantic drift from "selected" into "approved" or "decided"
 * - Selected = optimizer chose this | Decided = decidioner approved this | Executed = executor applied this
 */

import type { SelectedAction } from "./selected-action.contract";
import type { RejectedCandidateAction } from "./rejected-candidate-action.contract";

/**
 * OptimizationResult
 * Represents the structural output of an optimization execution.
 * Deterministically carries terminal action states: selected (yes) or rejected (no).
 * Does not perform optimization, scoring, or selection - purely structural.
 * Does not carry intermediate states (feasible but not selected) - result is final only.
 * Does not carry rankings, rationales, or metrics - structural outcome only.
 */
export interface OptimizationResult {
  /** Unique identifier for this optimization result (caller-provided) */
  readonly resultId: string;

  /** Selected actions chosen by optimization process (terminal final decisions) */
  readonly selectedActions: readonly SelectedAction[];

  /** Rejected candidate actions not carried forward (terminal rejection decisions) */
  readonly rejectedCandidates: readonly RejectedCandidateAction[];
}

/**
 * Optimization result behavior:
 * 
 * WHAT RESULT CONTAINS (TERMINAL STATES ONLY):
 * - resultId: unique identifier for this specific result (caller-provided, deterministic)
 * - selectedActions: actions selected for final output (terminal YES decision)
 *   - Selected means: passed feasibility AND chosen by selection strategy
 *   - Selected does NOT mean: executed or approved
 * - rejectedCandidates: actions that FAILED FEASIBILITY (terminal NO decision)
 *   - Rejected means: violated feasibility-relevant constraint (infeasible)
 *   - Rejected does NOT mean: non-selected feasible or uncompetitive
 * - All IDs come from source: reused from feasible/rejected action generation
 * - All values are caller-provided (no generation, no inference, no defaults)
 * 
 * WHAT RESULT DOES NOT CONTAIN (NON-TERMINAL STATES):
 * - Non-selected feasible actions: remain in runtime context (SelectionResult.nonSelectedFeasibleActions)
 *   - These are feasible candidates that didn't make the selection limit
 *   - They are intermediate state, NOT terminal
 *   - They NEVER appear in OptimizationResult (neither selectedActions nor rejectedCandidates)
 *   - MODEL A: Non-selected feasible ≠ Rejected (separate categories)
 * - Ranking order: selection priority detail (audit-level, not result)
 * - Rationale for selection: explanation detail (audit-level, not result)
 * - Constraint match/violation summary: evaluation detail (audit-level, not result)
 * - Confidence or approval flags: recommendation semantics (not optimization)
 * - Execution status or timestamp: execution semantics (out of scope)
 * - Scoring or metrics: analytics semantics (deferred to reporting)
 * - Policy outcome or override: decisioning semantics (not optimization)
 * 
 * RESULT MEANING (TERMINAL STATES ONLY):
 * - Result is collection of terminal action states: selected (yes) or rejected (no)
 * - No intermediate states appear in result
 * - If an action is not selected AND not rejected, it does not appear in result
 * - Result represents optimization outcome at terminal boundary only
 * - Result does not represent execution: selected actions are not executed, just selected
 * - Result does not represent recommendation: selected actions are not recommended, just selected
 * - Result is deterministic carrier: same outcome → same result always
 * 
 * SELECTED VS REJECTED SEMANTICS (MODEL A FORMALIZED):
 * - Selected: passed feasibility + chosen by selection strategy = INCLUDED in result
 * - Rejected: failed feasibility = EXCLUDED from result (infeasible)
 * - Non-selected feasible: passed feasibility + not chosen by selection = NOT IN RESULT (runtime state)
 * - These three categories are mutually exclusive and exhaustive
 * - Only Selected and Rejected are terminal states in OptimizationResult
 * - Non-selected feasible is intermediate, not terminal (stays in SelectionResult context)
 * 
 * RESULT VS AUDIT SEPARATION:
 * - Audit carries deeper traceability: why selected, why rejected, constraint details, selection context
 * - Result remains minimal: just the terminal decisions (selected vs rejected)
 * - Audit may include non-selected feasible actions for visibility
 * - Result never includes non-selected feasible (they are runtime state)
 * - Audit enriches result with context; result remains self-contained and lightweight
 * 
 * RESULT VS RECOMMENDATION BOUNDARY:
 * - Result is optimization outcome: what was optimized for
 * - Recommendation is approval/confidence: not in result scope
 * - Result never implies recommendation: selected ≠ approved
 * - Result is purely structural: no hidden approval or priority semantics
 * 
 * DETERMINISTIC RESULT DOCTRINE:
 * - Same OptimizationInput always produces same OptimizationResult
 * - Terminal states (selected/rejected) are deterministic given input constraints
 * - Non-terminal states (non-selected feasible) are deterministic but ephemeral (not propagated to result)
 * - No probabilistic search, no randomness, no hidden state
 * - No fallback semantics or hidden defaults
 * - No metadata overflow or semantic drift over time
 * - Result meaning is stable and time-invariant
 */

/**
 * Deprecated Note: Do NOT add these fields to OptimizationResult
 * - feasibleActions: feasible pool is runtime state, not result (stays in context)
 * - nonSelectedFeasibleActions: intermediate state, not terminal result
 * - rankings/scores: selection detail (audit-level)
 * - selectedOrder: ranking order (audit-level)
 * - rationale: explanation (audit-level)
 * - constraintMatches: evaluation summary (audit-level)
 * - confidence/probability: recommendation-level (out of scope)
 * - timestamp/executionStatus: execution-level (out of scope)
 * - metadata/tags: analytics-level (deferred to reporting)
 * Adding any of these fields would violate result boundary closure.
 */
