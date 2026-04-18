/**
 * Optimization Contracts Layer
 * Export surface for optimization foundation contracts, runtime service contracts, and snapshot/audit contracts.
 * Organized by responsibility: objectives, constraints, tie-breaking, candidate actions, action separation, result output, optimization boundary, runtime evaluation, and snapshot/audit.
 * 
 * FOUNDATION CONTRACTS (Phases 1-5): Structural language for optimization control
 * - Phase 1: Objective/constraint/tie-break contracts
 * - Phase 2: Candidate action contracts
 * - Phase 3: Action separation (feasible/selected/rejected) contracts
 * - Phase 4: Optimization result output contracts
 * - Phase 5: Optimization boundary (input/optimizer) contracts
 * 
 * RUNTIME CONTRACTS (Phases 1-4): Service contracts for deterministic evaluation
 * - Runtime Phase 1: Feasibility evaluator contracts
 * - Runtime Phase 2: Selection strategy contracts (bounded tie-break support)
 * - Runtime Phase 3: Runtime orchestrator contracts
 * - Runtime Phase 4: Domain specialization contracts (routing, stock, regional balancing)
 * 
 * RUNTIME PHASE 5: Closure
 * - Runtime is complete and closed
 * - No new runtime phases planned
 * - Foundation and runtime contracts are stable and responsibility-based
 * 
 * SNAPSHOT/AUDIT FOUNDATION PHASE 1: Optimization Snapshot Contracts
 * - OptimizationSnapshot: core carrier of optimization execution (snapshotId + input + result)
 * - Minimal Phase 1 scope: no metadata overflow, no weak audit markers
 * - Snapshot remains structural-only: no persistence, analytics, or recommendations
 */

// ============================================================================
// OPTIMIZATION OBJECTIVE CONTRACTS
// Caller-provided specification of what to optimize towards
// ============================================================================

export type {
  OptimizationObjectiveTarget,
  OptimizationDirection,
  OptimizationObjective,
} from "./optimization-objective.contract";

// ============================================================================
// OPTIMIZATION CONSTRAINT CONTRACTS
// Caller-provided structural boundaries and feasibility constraints
// ============================================================================

export type {
  CapacityConstraint,
  StockConstraint,
  SLATimeConstraint,
  RegionalRestrictionConstraint,
  RequiredActionConstraint,
  ForbiddenActionConstraint,
  DeterministicControlConstraint,
  OptimizationConstraint,
  OptimizationConstraintSet,
} from "./optimization-constraint.contract";

// ============================================================================
// OPTIMIZATION TIE-BREAK CONTRACTS
// Caller-provided deterministic ordering for equivalent solutions
// ============================================================================

export type {
  TieBreakStrategy,
  ExplicitOrderTieBreak,
  StandardTieBreak,
  OptimizationTieBreak,
} from "./optimization-tie-break.contract";

// ============================================================================
// OPTIMIZATION CANDIDATE ACTION CONTRACTS
// Caller-provided structural language for candidate actions
// ============================================================================

export type { ActionCategory } from "./optimization-action-category";

export type {
  CandidateActionIdentity,
  OptimizationCandidateAction,
} from "./optimization-candidate-action.contract";

export type { RoutingCandidateAction } from "./routing-candidate-action.contract";

export type {
  StockActionType,
  StockCandidateAction,
} from "./stock-candidate-action.contract";

export type {
  RegionalBalancingCandidateAction,
} from "./regional-balancing-candidate-action.contract";

// ============================================================================
// OPTIMIZATION ACTION SEPARATION CONTRACTS
// Caller-provided structural language for action state separation
// ============================================================================

export type {
  RejectionKind,
} from "./optimization-action-separation-kind";

export type {
  FeasibleAction,
} from "./feasible-action.contract";

export type {
  SelectedAction,
} from "./selected-action.contract";

export type {
  RejectedCandidateAction,
} from "./rejected-candidate-action.contract";

// ============================================================================
// OPTIMIZATION RESULT CONTRACTS
// Caller-provided structural output of optimization process
// ============================================================================

export type {
  OptimizationResult,
} from "./optimization-result.contract";

// ============================================================================
// OPTIMIZATION BOUNDARY CONTRACTS
// Deterministic optimizer input/output transformation boundary
// ============================================================================

export type {
  OptimizationInput,
} from "./optimization-input.contract";

export type {
  OptimizationOptimizer,
} from "./optimization-optimizer.contract";

// ============================================================================
// OPTIMIZATION RUNTIME CONTRACTS
// Runtime evaluation surfaces (feasibility, selection, ranking)
// ============================================================================

export type {
  FeasibilityEvaluationResult,
  FeasibleCandidateReference,
  RejectedCandidateReference,
  OptimizationFeasibilityEvaluator,
} from "./optimization-feasibility-evaluator.contract";

export type {
  SelectionInput,
  SelectionResult,
  OptimizationSelectionStrategy,
  RuntimePhase2FifoTieBreak,
  RuntimePhase2TieBreak,
} from "./optimization-selection-strategy.contract";

// ============================================================================
// OPTIMIZATION RUNTIME ORCHESTRATOR CONTRACTS
// Runtime orchestration surface (composes feasibility evaluation + selection)
// ============================================================================

export type {
  OptimizationRuntimeOrchestrationInput,
  OptimizationRuntimeOrchestrator,
} from "./optimization-runtime-orchestrator.contract";

// ============================================================================
// OPTIMIZATION DOMAIN RUNTIME CONTRACTS
// Domain-specialized runtime surfaces (routing, stock, regional balancing)
// ============================================================================

export type {
  RoutingSelectedAction,
  RoutingRejectedCandidate,
  RoutingOptimizationRuntimeInput,
  RoutingOptimizationResult,
  RoutingOptimizationRuntime,
} from "./routing-optimization-runtime.contract";

export type {
  StockSelectedAction,
  StockRejectedCandidate,
  StockOptimizationRuntimeInput,
  StockOptimizationResult,
  StockOptimizationRuntime,
} from "./stock-optimization-runtime.contract";

export type {
  RegionalBalancingSelectedAction,
  RegionalBalancingRejectedCandidate,
  RegionalBalancingOptimizationRuntimeInput,
  RegionalBalancingOptimizationResult,
  RegionalBalancingOptimizationRuntime,
} from "./regional-balancing-optimization-runtime.contract";

// ============================================================================
// OPTIMIZATION SNAPSHOT/AUDIT CONTRACTS
// Snapshot language for capturing optimization runtime output
// Audit language for capturing optimization execution transparency
// ============================================================================

export type {
  OptimizationSnapshot,
} from "./optimization-snapshot.contract";

export type {
  SelectedActionAuditTrace,
  RejectedCandidateAuditTrace,
  OptimizationAudit,
  OptimizationExecutionOutcome,
} from "./optimization-audit.contract";

export type {
  OptimizationSnapshotBuilderInput,
  OptimizationSnapshotBuilder,
} from "./optimization-snapshot-builder.contract";

export type {
  RoutingOptimizationOutcomeProjection,
} from "./routing-optimization-outcome-projection.contract";

export type {
  StockOptimizationOutcomeProjection,
} from "./stock-optimization-outcome-projection.contract";

export type {
  RegionalBalancingOptimizationOutcomeProjection,
} from "./regional-balancing-optimization-outcome-projection.contract";


