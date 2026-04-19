/**
 * Optimization Layer - Foundation Contracts and Runtime Services
 * 
 * ARCHITECTURE:
 * - FOUNDATION: Structural contract language for optimization control and deterministic transformation
 * - RUNTIME: Deterministic evaluation services that respect foundation contracts
 * - SNAPSHOT/AUDIT: Immutable execution outcome with domain-specific projections
 * 
 * LAYER RESPONSIBILITY:
 * - FOUNDATION CONTRACTS: Pure input/output/boundary language - what to optimize, what constraints apply,
 *   what actions to evaluate, how to select, and what result means
 * - RUNTIME SERVICES: Deterministic transformation that respects all foundation boundaries - no policy,
 *   no ML, no adaptive behavior, pure function semantics only
 * - SNAPSHOT/AUDIT CONTRACTS: Immutable outcome capture with structural traceability - what was computed,
 *   what was selected/rejected, and source references for verification
 * 
 * FOUNDATION CLOSURE SUMMARY:
 * - Phase 1 (Objective): Single-objective deterministic only; multi-objective composition at caller level
 * - Phase 2 (Constraints): Feasibility-relevant only (forbidden, regional); deferred constraints preserved
 * - Phase 3 (Result): Terminal states only (selected yes, rejected no); non-selected feasible stays in runtime
 * - Phase 4 (Decision): Selected ? Decided ? Executed; optimization is compute layer only
 * - Phase 5 (Determinism): Pure function, no randomness, no ID generation, no mutation
 * - Phase 6 (Trace/Audit): Complete structural traceability from input through result to audit
 * 
 * RUNTIME SUMMARY:
 * - Phase 1 (Feasibility): Evaluates feasibility-relevant constraints only; deterministic
 * - Phase 2 (Selection): Applies explicit_order or fifo tieBreak; real selection (not 1:1)
 * - Phase 3 (Orchestration): Composes phases 1+2; all IDs reused from caller-provided sources
 * - Phase 4 (Domain Specialization): Thin adapters for routing, stock, regional balancing
 * 
 * SNAPSHOT/AUDIT SUMMARY:
 * - Phase 1 (Snapshot): Input + Result composition; enables source traceability
 * - Phase 2 (Audit): Selected/rejected action traces with caller-provided source references
 * - Phase 3 (Builder): Deterministic composition of snapshot + audit into outcome
 * - Phase 4 (Projections): Domain-specific views that preserve full traceability
 * 
 * EXPORT ORGANIZATION:
 * - All foundation contracts grouped by responsibility: objective, constraint, tie-break, candidates,
 *   action separation, result, input boundary, optimizer boundary
 * - All runtime contracts grouped by phase: feasibility, selection, orchestration, domain runtimes
 * - All snapshot/audit contracts and services exported for consumption
 * - All exports are typed and responsibility-based, with no unnamed re-exports
 * 
 * FINAL CLOSURE (Phase 7):
 * - Optimization layer is formally and completely closed
 * - No new capability, no new phases, no expansion of existing phases
 * - All boundaries are clean, responsibility-based, and stable
 * - Export surfaces are responsibility-based and well-organized
 * - Comment/documentation hygiene completed: reduced redundancy while preserving critical boundaries
 * - Layer is consumption-ready and requires no further modification within this thread
 */

// Foundation and Runtime Contracts
export * from "./contracts/index";

// Runtime Services
export { deterministicOptimizationFeasibilityEvaluator } from "./services/deterministic-optimization-feasibility-evaluator";
export { deterministicOptimizationSelectionStrategy } from "./services/deterministic-optimization-selection-strategy";
export { deterministicOptimizationRuntimeOrchestrator } from "./services/deterministic-optimization-runtime-orchestrator";
export { routingOptimizationRuntime } from "./services/routing-optimization-runtime";
export { stockOptimizationRuntime } from "./services/stock-optimization-runtime";
export { regionalBalancingOptimizationRuntime } from "./services/regional-balancing-optimization-runtime";

// Snapshot/Audit Services
export { deterministicOptimizationSnapshotBuilder } from "./services/deterministic-optimization-snapshot-builder";
export { routingOptimizationOutcomeProjection } from "./services/routing-optimization-outcome-projection";
export { stockOptimizationOutcomeProjection } from "./services/stock-optimization-outcome-projection";
export { regionalBalancingOptimizationOutcomeProjection } from "./services/regional-balancing-optimization-outcome-projection";