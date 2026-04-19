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
 * OBJECTIVE BOUNDARY CLOSURE (Phase 1):
 * - Objective layer is formally closed
 * - Single-objective deterministic optimization: one target + direction per invocation
 * - Multi-objective weighting explicitly OUT OF SCOPE
 * - Optimization vs decisioning boundary remains clean and formal
 * 
 * CONSTRAINT SEMANTICS & FEASIBILITY CLOSURE (Phase 2):
 * - Constraint layer is formally closed with explicit phase positioning
 * - Feasibility-Relevant Constraints (evaluated at feasibility time):
 *   - ForbiddenActionConstraint: explicit exclusion from candidate properties
 *   - RegionalRestrictionConstraint: regional membership checks for region-aware candidates
 * - Deferred / Non-Feasibility-Relevant Constraints (not evaluated at feasibility time):
 *   - CapacityConstraint: requires runtime capacity state
 *   - StockConstraint: requires runtime stock state
 *   - SLATimeConstraint: requires runtime timing state
 *   - RequiredActionConstraint: selection requirement (not feasibility check)
 *   - DeterministicControlConstraint: ordering preference (not feasibility check)
 * - Elimination of Fake Completeness: deferred constraints are preserved but not silently applied
 * - Candidate vs Feasible boundary remains clean and distinct
 * - Feasibility ≠ Selection (no selection logic at feasibility time)
 * 
 * RESULT BOUNDARY CLOSURE (Phase 3):
 * - Result layer is formally closed with explicit semantic boundaries
 * - Result surface is minimal: only selectedActions + rejectedCandidates (terminal states only)
 * - MODEL A FORMALIZED (Intermediate Clarification):
 *   - Rejected = candidates that FAILED FEASIBILITY (infeasible only)
 *   - Non-selected feasible = candidates that PASSED FEASIBILITY but not selected (runtime state)
 *   - These are DISTINCT categories: rejected ≠ non-selected-feasible
 *   - Only terminal states in result: selected (yes) and rejected (no)
 *   - Non-selected feasible never appears in result (stays in runtime context)
 * - Result does NOT carry:
 *   - Non-selected feasible actions (intermediate states, remain in runtime context)
 *   - Ranking order or priority (selection detail, audit-level concern)
 *   - Constraint match summary or rationale (audit-level detail, not result scope)
 *   - Confidence, approval, or recommendation flags (not optimization, not result scope)
 *   - Execution status or timestamp (execution-level, out of scope)
 *   - Analytics, metrics, or derived fields (reporting-level, out of scope)
 * - Result meaning: binary terminal states (selected yes/no)
 * - Selected ≠ Executed (selection is distinct from execution)
 * - Result ≠ Recommendation (result is outcome, not approval)
 * - Rejected ≠ Non-selected-feasible (semantically distinct categories)
 * - Result vs Audit: result is minimal, audit carries deeper context
 * - Deterministic result doctrine: same outcome always means same result
 * 
 * DECISION BOUNDARY CLOSURE (Phase 4):
 * - Decision boundary is formally closed: optimization ≠ decisioning ≠ execution
 * - Optimizer responsibility: compute best outcome under objective + constraints + strategy (deterministic)
 * - Optimizer is NOT responsible for: approval, authorization, policy evaluation
 * - Optimizer is NOT responsible for: execution, state mutation, runtime application
 * - Selected means: optimizer chose this deterministically under constraints
 * - Selected does NOT mean: decidioner approved this (approval is later layer)
 * - Selected does NOT mean: executor applied this (execution is later layer)
 * - Selected does NOT mean: recommended or preferred (no preference semantics)
 * - Workflow layers (separate responsibilities):
 *   - Optimization: compute what's best technically (deterministic, structural)
 *   - Decisioning: evaluate business logic, risk, policy, approve/reject (later layer)
 *   - Execution: apply decision and mutate runtime state (later layer)
 * - OptimizationResult is structural carrier: just optimization outcome
 * - No semantic drift: \"selected\" stays as pure \"optimizer chose this\" (no approval/execution semantics)
 * - Result carries NO fields for decisioning/execution layers:
 *   - No approval status, authorization tokens, or policy outcome
 *   - No execution status, callbacks, or state mutation markers
 *   - No confidence, probability, or risk assessment
 * - Deterministic optimization doctrine preserved: same input → same output always
 * 
 * DETERMINISM & FORBIDDEN ZONE CLOSURE (Phase 5):
 * - DETERMINISM DOCTRINE: Optimization is formally a pure deterministic function
 *   - Same input ALWAYS produces identical output (no randomness, no time-based variation)
 *   - All computation is structural: explicitly specified, no hidden heuristics
 *   - All paths are reproducible: identical inputs produce identical outputs across runs
 *   - All identifiers are caller-provided: no ID generation, no generated timestamps
 *   - No hidden fallback semantics: all behavior explicit in contracts
 *   - No hidden priority expansion: no implicit constraint escalation
 *   - No hidden runtime state: everything deterministic from inputs alone
 * 
 * - FORBIDDEN ZONE: Behaviors explicitly prohibited in optimization layer
 *   - RANDOMNESS FORBIDDEN: Math.random(), Date.now(), any time-based variation
 *   - ID GENERATION FORBIDDEN: all identifiers caller-provided only
 *   - ML INFERENCE FORBIDDEN: no learned models, no neural networks, no probabilistic inference
 *   - HIDDEN WEIGHTS FORBIDDEN: no implicit prioritization, no hidden scoring
 *   - ADAPTIVE LEARNING FORBIDDEN: no feedback loops, no dynamic optimization, no adaptation
 *   - PROBABILISTIC SEARCH FORBIDDEN: no Monte Carlo, no genetic algorithms, no stochastic search
 *   - STOCHASTIC OPTIMIZATION FORBIDDEN: no randomized tie-breaking, no probabilistic selection
 *   - POLICY OVERRIDE FORBIDDEN: no business logic substitution of inputs
 *   - AUTO-EXECUTION FORBIDDEN: no automatic action application, no state mutation
 *   - MUTATION FORBIDDEN: no modification of source input state or cached state
 *   - HIDDEN SIDE EFFECTS FORBIDDEN: no implicit callbacks, no lazy evaluation surprises
 *   - RECOMMENDATION LOGIC FORBIDDEN: no confidence scoring, no priority inference, no approval logic
 *   - EXECUTION LOGIC FORBIDDEN: no state application, no runtime mutation, no transaction semantics
 *   - ANALYTICS FORBIDDEN: no telemetry, no metrics collection, no reporting
 *   - PERSISTENCE FORBIDDEN: no storage binding, no cache mutation, no stateful side effects
 *   - UNSUPPORTED TIE-BREAK FORBIDDEN: only explicit_order and fifo allowed (capacity/cost/time/availability require execution context)
 * 
 * - CONTRACT HONESTY: Contracts explicitly document what optimization IS and IS NOT
 *   - OptimizationOptimizer is pure deterministic function: input → output transformation only
 *   - OptimizationRuntimeOrchestrator is deterministic composition: Phase 1 + Phase 2 with no feedback
 *   - OptimizationFeasibilityEvaluator is deterministic constraint check: no hidden inference
 *   - OptimizationSelectionStrategy is deterministic selection: no hidden scoring or ML
 *   - All contracts are explicit: no fake capability wording, no implied AI/learning
 *   - All runtime is structural: no classes, no factories, no builders, no reflection
 * 
 * - BOUNDARY PRESERVATION: Phase 5 enforces all previously closed boundaries
 *   - Objective boundary: single-objective, no multi-objective weighting
 *   - Constraint boundary: feasibility-relevant only, deferred constraints never silently applied
 *   - Result boundary: minimal terminal states only, no intermediate state exposure
 *   - Decision boundary: selected ≠ approved ≠ executed (separate layers)
 *   - Determinism boundary: pure function, no adaptive/probabilistic/learning behavior
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
 * 
 * SNAPSHOT/AUDIT FOUNDATION PHASE 2: Optimization Audit Surface
 * - SelectedActionAuditTrace: audit trace for selected actions (enhanced with source references)
 * - RejectedCandidateAuditTrace: audit trace for rejected candidates (aligned to result naming)
 * - OptimizationAudit: complete audit trace structure
 * - OptimizationExecutionOutcome: snapshot + audit composition (shared outcome foundation)
 * - Audit remains structural-only: no persistence, analytics, or recommendations
 * 
 * SNAPSHOT/AUDIT FOUNDATION PHASE 3: Deterministic Snapshot Builder
 * - OptimizationSnapshotBuilderInput: explicit builder input (pre-built snapshot + audit)
 * - OptimizationSnapshotBuilder: deterministic composition boundary
 * - Builder remains structural-only: pure transformation, no ID generation, no analytics
 * 
 * SNAPSHOT/AUDIT FOUNDATION PHASE 4: Domain Snapshot Projection
 * - RoutingOptimizationOutcomeProjection: routing domain-specific projection surface
 * - StockOptimizationOutcomeProjection: stock domain-specific projection surface
 * - RegionalBalancingOptimizationOutcomeProjection: regional balancing domain-specific projection surface
 * - All projections extract from shared OptimizationExecutionOutcome
 * - Projections remain structural-only: domain-explicit naming, no analytics
 * 
 * SNAPSHOT/AUDIT FOUNDATION PHASE 5: CLOSURE
 * - Snapshot/Audit foundation is complete and formally closed
 * - Phase 1-4 coverage: snapshot carrier, audit traces, deterministic builder, domain projections
 * - All phases are protocol-clean and responsibility-based
 * - All phases maintain shared OptimizationExecutionOutcome as common foundation
 * - No new capability, analytics, reporting, or persistence planned after closure
 * - Export surfaces are finalized and stable
 * - Foundation is consumption-ready and requires no reopening
 * 
 * TRACE / AUDIT DEEPENING CLOSURE (Phase 6):
 * - Snapshot-level traceability is formalized and deepened
 *   - Snapshot carries complete input for objective/constraint/candidate source traceability
 *   - Snapshot enables trace back: result selectedActions/rejectedCandidates → input candidateActions
 *   - Objective traceability: input.objective defines what was optimized for
 *   - Constraint traceability: input.constraints defines feasibility rules evaluated
 *   - Candidate traceability: input.candidateActions are the source for all result actions
 * - Audit-level traceability is formalized and deepened
 *   - SelectedActionAuditTrace now carries sourceCandidateId + sourceFeasibleId (caller-provided)
 *   - RejectedCandidateAuditTrace now carries sourceCandidateId + rejectionKind (explicit)
 *   - Complete trace chain: candidate → feasible/rejected → selected via audit references
 *   - Audit enables full reconstruction of optimization path without ambiguity
 * - Outcome-level traceability is preserved
 *   - OptimizationExecutionOutcome combines snapshot + audit for complete visibility
 *   - Snapshot carries input, audit carries selected/rejected traces
 *   - Together they enable full reconstruction of optimization execution
 * - Projection-level traceability is preserved
 *   - Domain projections carry full audit with source references (caller-provided)
 *   - No traceability loss in projection: audit maintains all trace references
 *   - Shared OptimizationExecutionOutcome remains the common foundation across domains
 * - Traceability doctrine is formalized
 *   - All trace references are explicit and caller-provided (not generated)
 *   - No generated trace markers, no derived analytics disguised as audit
 *   - Audit structure is immutable and deterministic
 *   - Traceability chain is unbroken: input → result → audit → outcome
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


