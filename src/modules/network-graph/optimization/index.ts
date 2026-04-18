/**
 * Optimization Layer - Foundation Contracts and Runtime Services
 * 
 * FOUNDATION: Structural contract language for optimization control and deterministic transformation boundary.
 * RUNTIME: Deterministic evaluation services that implement optimization transformation.
 * 
 * FOUNDATION PHASE 1: Objectives, Constraints, Tie-Breaks
 * - OptimizationObjective: what to optimize towards
 * - OptimizationConstraintSet: structural boundaries to respect
 * - OptimizationTieBreak: deterministic ordering for equivalent solutions
 * 
 * FOUNDATION PHASE 2: Candidate Actions
 * - ActionCategory: bounded vocabulary of candidate action types
 * - OptimizationCandidateAction: proposed moves for optimization to evaluate
 * - RoutingCandidateAction: proposed routing moves
 * - StockCandidateAction: proposed stock actions
 * - RegionalBalancingCandidateAction: proposed regional balancing moves
 * 
 * FOUNDATION PHASE 3: Action Separation
 * - FeasibleAction: candidate that has passed feasibility boundaries
 * - SelectedAction: feasible action chosen for final optimization output
 * - RejectedCandidateAction: candidate that is not carried forward
 * - RejectionKind: bounded vocabulary of rejection reasons
 * 
 * FOUNDATION PHASE 4: Optimization Results
 * - OptimizationResult: structural output carrier of optimization process
 *   - carries selected actions explicitly
 *   - carries rejected candidates explicitly
 *   - no runtime optimization or scoring logic embedded
 * 
 * FOUNDATION PHASE 5: Deterministic Optimization Boundary
 * - OptimizationInput: explicit composition of all optimization inputs (objective, constraints, tie-break, candidates)
 * - OptimizationOptimizer: deterministic transformation boundary contract
 *   - Same input always produces same output (deterministic guarantee)
 *   - Pure function boundary: OptimizationInput → OptimizationResult
 *   - No hidden state, no mutation, no side effects
 *   - Defines explicit input/output separation
 * 
 * RUNTIME PHASE 1: Feasibility Evaluation
 * - OptimizationFeasibilityEvaluator: deterministic feasibility evaluation service
 *   - FeasibilityEvaluationResult: explicit output of feasibility assessment
 *   - Evaluates candidates against feasibility constraints
 *   - Produces feasible actions and rejected candidates
 *   - No selection logic, no scoring, no ranking
 *   - Same input always produces same output (deterministic)
 * - DeterministicOptimizationFeasibilityEvaluator: concrete implementation
 *   - Transforms OptimizationInput into FeasibilityEvaluationResult
 *   - No mutation of input state
 *   - Deterministic candidate → feasible/rejected transformation
 * 
 * RUNTIME PHASE 2: Selection Strategy
 * - OptimizationSelectionStrategy: deterministic selection transformation service
 *   - SelectionResult: explicit output of selection assessment
 *   - Performs real selection from feasible pool (not 1:1 projection)
 *   - Applies tieBreak to order feasible actions deterministically
 *   - Selects subset up to selectionLimit (caller-provided bound)
 *   - Includes explicit non-selected feasible actions in output
 *   - No scoring, no ranking, no recommendation
 *   - Same input always produces same output (deterministic)
 * - DeterministicOptimizationSelectionStrategy: concrete implementation
 *   - Transforms SelectionInput into SelectionResult with real selection
 *   - Applies tieBreak (explicit_order or standard strategies like fifo)
 *   - TieBreak meaningfully orders feasible actions before selection
 *   - Service owns selection decision (not caller projection)
 *   - No mutation of input state
 *   - Deterministic feasible → selected subset transformation
 * 
 * RUNTIME PHASE 3: Optimization Runtime Orchestration
 * - OptimizationRuntimeOrchestrator: deterministic orchestration boundary
 *   - OptimizationRuntimeOrchestrationInput: explicit orchestration input (optimization, limit, resultId only)
 *   - Composes Phase 1 (feasibility evaluation) and Phase 2 (deterministic selection)
 *   - Transforms OptimizationInput into OptimizationResult in explicit orchestration flow
 *   - No ID generation: all identifiers caller-provided and reused from source references
 *   - Same input always produces same output (deterministic)
 * - DeterministicOptimizationRuntimeOrchestrator: concrete implementation
 *   - Orchestrates Phase 1 evaluation and Phase 2 selection into complete runtime
 *   - All IDs traced to caller-provided sources via reuse through transformation chain
 *   - No mutation of input state
 *   - Deterministic complete optimization → result transformation
 * 
 * RUNTIME PHASE 4: Domain Runtime Specialization
 * - RoutingOptimizationRuntime: domain-specialized routing optimizer
 *   - RoutingOptimizationRuntimeInput: explicit input with routing candidates only
 *   - Tie-break input narrowed to RuntimePhase2TieBreak (explicit_order or fifo only)
 *   - Prevents invalid strategies at domain contract level
 *   - RoutingSelectedAction, RoutingRejectedCandidate: domain-specific action types
 *   - Transforms routing candidates into RoutingOptimizationResult
 *   - Adapts shared orchestration to routing domain
 *   - No new logic, only domain adaptation
 * - RoutingOptimizationRuntime service: minimal adapter
 *   - Converts routing input to shared input
 *   - Calls shared orchestrator
 *   - Returns routing domain result with domain-specific action types
 * - StockOptimizationRuntime: domain-specialized stock optimizer
 *   - StockOptimizationRuntimeInput: explicit input with stock candidates only
 *   - Tie-break input narrowed to RuntimePhase2TieBreak (explicit_order or fifo only)
 *   - Prevents invalid strategies at domain contract level
 *   - StockSelectedAction, StockRejectedCandidate: domain-specific action types
 *   - Transforms stock candidates into StockOptimizationResult
 *   - Adapts shared orchestration to stock domain
 *   - No new logic, only domain adaptation
 * - StockOptimizationRuntime service: minimal adapter
 *   - Converts stock input to shared input
 *   - Calls shared orchestrator
 *   - Returns stock domain result with domain-specific action types
 * - RegionalBalancingOptimizationRuntime: domain-specialized regional balancing optimizer
 *   - RegionalBalancingOptimizationRuntimeInput: explicit input with regional balancing candidates only
 *   - Tie-break input narrowed to RuntimePhase2TieBreak (explicit_order or fifo only)
 *   - Prevents invalid strategies at domain contract level
 *   - RegionalBalancingSelectedAction, RegionalBalancingRejectedCandidate: domain-specific action types
 *   - Transforms regional balancing candidates into RegionalBalancingOptimizationResult
 *   - Adapts shared orchestration to regional balancing domain
 *   - No new logic, only domain adaptation
 * - RegionalBalancingOptimizationRuntime service: minimal adapter
 *   - Converts regional balancing input to shared input
 *   - Calls shared orchestrator
 *   - Returns regional balancing domain result with domain-specific action types
 * 
 * RUNTIME PHASE 5: Closure
 * - Optimization runtime is complete and formally closed
 * - Foundation contracts (phases 1-5): stable, responsibility-based, no reopening planned
 * - Runtime services (phases 1-4): deterministic, protocol-clean, no expansion planned
 * - Shared orchestration remains the common foundation for all domains
 * - Domain specialization remains thin and explicit adapters only
 * - Export surfaces finalized and responsibility-based
 * - No new capabilities or features added after this point
 * 
 * SNAPSHOT/AUDIT FOUNDATION PHASE 1: Optimization Snapshot Contracts
 * - OptimizationSnapshot: core carrier of optimization execution
 *   - Carries unique snapshot identifier (caller-provided)
 *   - Carries optimization input (what was requested)
 *   - Carries optimization result (what was produced)
 *   - Remains portable and audit-readable
 *   - No persistence, no analytics, no recommendations
 *   - All identifiers caller-provided only
 * - Phase 1 minimal scope: identity + input + result
 *   - Core carrier establishes structural traceability
 *   - No metadata overflow: snapshotId only
 *   - No weak audit markers: Phase 1 defers audit layering to later phases
 *   - No optional fields that risk semantic drift
 *
 * SNAPSHOT/AUDIT FOUNDATION PHASE 2: Optimization Audit Surface
 * - SelectedActionAuditTrace: audit trace for selected actions
 *   - Links selected action to selection decision (caller-provided trace reference)
 *   - Remains structural: no scoring, confidence, or decision logic
 *   - Carries only action ID and optional trace reference
 * - RejectedCandidateAuditTrace: audit trace for rejected actions
 *   - Links rejected action to feasibility evaluation (caller-provided trace reference)
 *   - Remains structural: no severity, policy override, or policy outcome
 *   - Carries only rejected action ID and optional trace reference
 *   - Naming aligns with result contract RejectedCandidateAction.rejectedActionId
 * - OptimizationAudit: complete audit trace structure
 *   - Composes selected and rejected action traces
 *   - Carries audit ID and optional orchestration trace reference
 *   - All identifiers caller-provided only
 * - OptimizationExecutionOutcome: snapshot + audit composition
 *   - Carries OptimizationSnapshot for input/result transparency
 *   - Carries OptimizationAudit for selected/rejected action transparency
 *   - Caller-readable and transportable
 *   - No persistence, no reporting, no analytics
 * - Phase 2 scope: structural audit surface only
 *   - No execution history
 *   - No decision scoring
 *   - No policy evaluation
 *   - No derived analytics
 *
 * SNAPSHOT/AUDIT FOUNDATION PHASE 3: Deterministic Snapshot Builder
 * - OptimizationSnapshotBuilderInput: explicit input to builder
 *   - Carries pre-built OptimizationSnapshot and OptimizationAudit
 *   - Both snapshot and audit are caller-provided and complete
 *   - No partial or incomplete inputs
 * - OptimizationSnapshotBuilder: deterministic composition boundary
 *   - Composes snapshot and audit into OptimizationExecutionOutcome
 *   - Same input always produces same output (deterministic guarantee)
 *   - Input snapshot and audit are never mutated (immutability guarantee)
 *   - No ID generation, no analytics, no derived fields (structural guarantee)
 *   - Pure transformation: no side effects, no state mutation
 * - DeterministicOptimizationSnapshotBuilder: concrete implementation
 *   - Constant satisfying OptimizationSnapshotBuilder interface
 *   - Produces OptimizationExecutionOutcome by composing inputs
 *   - Deterministic, immutable, structural-only
 * - Phase 3 scope: deterministic composition boundary only
 *   - No persistence
 *   - No analytics or metrics
 *   - No recommendation or decision logic
 *   - No execution history tracking
 *
 * SNAPSHOT/AUDIT FOUNDATION PHASE 4: Domain Snapshot Projection
 * - RoutingOptimizationOutcomeProjection: routing domain-specific projection
 *   - Carries shared OptimizationExecutionOutcome in routing boundary
 *   - Minimal projection service returns outcome in domain context
 *   - No analytics, no metrics, no derived fields
 *   - Preserves full snapshot/audit chain unmodified
 * - StockOptimizationOutcomeProjection: stock domain-specific projection
 *   - Carries shared OptimizationExecutionOutcome in stock boundary
 *   - Minimal projection service returns outcome in domain context
 *   - No analytics, no metrics, no derived fields
 *   - Preserves full snapshot/audit chain unmodified
 * - RegionalBalancingOptimizationOutcomeProjection: regional balancing domain-specific projection
 *   - Carries shared OptimizationExecutionOutcome in regional balancing boundary
 *   - Minimal projection service returns outcome in domain context
 *   - No analytics, no metrics, no derived fields
 *   - Preserves full snapshot/audit chain unmodified
 * - Phase 4 scope: domain-explicit projection boundaries only
 *   - No analytics or reporting
 *   - No recommendation or decision logic
 *   - No persistence or storage adapters
 *   - No visualization or dashboard output
 *   - Shared OptimizationExecutionOutcome remains the common foundation
 * 
 * Core Responsibility:
 * FOUNDATION: Define explicit caller-provided language for optimization inputs, action separation, result output,
 * and the deterministic transformation boundary.
 * RUNTIME: Implement deterministic evaluation services that respect foundation contracts.
 * All surfaces remain structural-only: no hidden behavior, no unrestricted policies, no implicit inference.
 * 
 * Layer Boundary: 
 * - Foundation contracts are purely structural input, output, and boundary language
 * - Runtime services implement deterministic evaluation against explicit boundaries
 * - Service implementations must respect all foundation boundary contracts
 * - Future selection/ranking algorithms follow runtime phase 2+
 */

export * from "./contracts/index";

// ============================================================================
// RUNTIME SERVICES
// ============================================================================

// Runtime Phase 1: Deterministic Feasibility Evaluator
export { deterministicOptimizationFeasibilityEvaluator } from "./services/deterministic-optimization-feasibility-evaluator";

// Runtime Phase 2: Deterministic Selection Strategy
export { deterministicOptimizationSelectionStrategy } from "./services/deterministic-optimization-selection-strategy";

// Runtime Phase 3: Deterministic Optimization Runtime Orchestrator
export { deterministicOptimizationRuntimeOrchestrator } from "./services/deterministic-optimization-runtime-orchestrator";

// Runtime Phase 4: Domain Specialization Runtimes
export { routingOptimizationRuntime } from "./services/routing-optimization-runtime";
export { stockOptimizationRuntime } from "./services/stock-optimization-runtime";
export { regionalBalancingOptimizationRuntime } from "./services/regional-balancing-optimization-runtime";

// Snapshot/Audit Phase 3: Deterministic Snapshot Builder
export { deterministicOptimizationSnapshotBuilder } from "./services/deterministic-optimization-snapshot-builder";

// Snapshot/Audit Phase 4: Domain Outcome Projections
export { routingOptimizationOutcomeProjection } from "./services/routing-optimization-outcome-projection";
export { stockOptimizationOutcomeProjection } from "./services/stock-optimization-outcome-projection";
export { regionalBalancingOptimizationOutcomeProjection } from "./services/regional-balancing-optimization-outcome-projection";
