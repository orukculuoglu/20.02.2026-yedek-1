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
 * INTEGRATION BOUNDARIES (DOCUMENTED, NOT CONTRACTED):
 * These boundaries are defined through existing contracts and runtime behavior, not through new integration contracts.
 * 1. CANDIDATE SOURCE BOUNDARY:
 *    - Candidates provided by upstream domain layer (routing, stock, regional-balancing)
 *    - Optimizer DOES NOT generate candidates
 *    - All candidate identifiers are caller-provided (candidateId, actionId)
 *    - OptimizationCandidateAction is the vehicle; upstream responsibility to populate it
 * 
 * 2. OPTIMIZATION INPUT ASSEMBLY BOUNDARY:
 *    - Caller (integration/business layer) is responsible for assembling OptimizationInput
 *    - Optimizer DOES NOT assemble input; it only consumes input
 *    - Objective is provided by caller: which target to optimize and which direction
 *    - Constraints are provided by caller: which boundary/feasibility rules to apply
 *    - TieBreak is provided by caller: which deterministic ordering strategy for equivalents
 *    - CandidateActions are provided by caller: which actions to evaluate
 *    - All inputs must be explicit; no hidden defaults or inference
 *    - OptimizationInput is the interface; caller must populate all fields
 * 
 * 3. OPTIMIZATION EXECUTION BOUNDARY:
 *    - OptimizationOptimizer is pure deterministic function: OptimizationInput → OptimizationResult
 *    - Same input always produces identical output
 *    - No side effects, no mutations, no hidden state
 *    - No decisioning logic, no approval logic, no execution logic
 *    - Result carries selected actions and rejected candidates (terminal states only)
 * 
 * 4. RESULT HANDOFF BOUNDARY:
 *    - OptimizationResult is structural outcome: what optimizer computed, not what to do
 *    - Selected actions: passed feasibility AND chosen by selection strategy (terminal yes)
 *    - Rejected candidates: failed feasibility (terminal no)
 *    - OptimizationSnapshot: enables full reconstruction of optimization execution
 *    - OptimizationAudit: provides deeper context with source references
 *    - Downstream (decisioning/execution) receives result as INPUT, not as INSTRUCTION
 *    - Downstream MUST apply decisioning logic explicitly (not implicit)
 *    - Downstream MUST apply execution logic explicitly (not implicit)
 *    - "Selected" does NOT mean "approved" or "executed" - only "optimized choice"
 * 
 * 5. SEPARATION PRESERVATION:
 *    - Optimization layer = pure deterministic compute only
 *    - Decisioning layer = business logic, policy, approval (separate, downstream)
 *    - Execution layer = state mutation, callbacks (separate, downstream)
 *    - No semantic drift: selected ≠ approved ≠ executed
 *    - No hidden handoff semantics: result is outcome, not implicit instruction
 * 
 * FOUNDATION CLOSURE SUMMARY:
 * - Phase 1 (Objective): Single-objective deterministic only; multi-objective composition at caller level
 * - Phase 2 (Constraints): Feasibility-relevant only (forbidden, regional); deferred constraints preserved
 * - Phase 3 (Result): Terminal states only (selected yes, rejected no); non-selected feasible stays in runtime
 * - Phase 4 (Decision): Selected ≠ Decided ≠ Executed; optimization is compute layer only
 * - Phase 5 (Determinism): Pure function, no randomness, no ID generation, no mutation
 * - Phase 6 (Trace/Audit): Complete structural traceability from input through result to audit
 * - Phase 7 (Final Closure): Export hygiene, comment compression, responsibility confirmation
 * 
 * INTEGRATION TOPIC (CLARIFICATION, NOT EXPANSION):
 * Boundaries documented above make clear: optimization is boundary layer only, not integration framework
 * - No new integration contracts or interfaces
 * - Existing contracts and documentation provide all necessary boundary clarity
 * - Integration is caller's responsibility using existing contracts
 * 
 * ADVANCED CONSTRAINT / SELECTION EXPANSION (Current Phase):
 * Activates previously deferred runtime-aware constraint areas using existing runtime state/context surfaces.
 * 
 * DEFERRED CONSTRAINTS NOW ACTIVATED:
 * 1. CAPACITY FEASIBILITY (New)
 *    - Previously deferred; now activated with structural support
 *    - Stage: Feasibility (Phase 1 of optimization)
 *    - Uses: CapacityState from RuntimeContext
 *    - Candidate provides: CandidateCapacityProfile with capacity requirements
 *    - Output: CapacityFeasibility (yes/no/unknown)
 *    - Module: ./constraints/capacity-feasibility.contract.ts
 *
 * 2. STOCK FEASIBILITY (New)
 *    - Previously deferred; now activated with structural support
 *    - Stage: Feasibility (Phase 1 of optimization)
 *    - Uses: StockState from RuntimeContext
 *    - Candidate provides: CandidateStockProfile with inventory requirements
 *    - Output: StockFeasibility (yes/no/unknown)
 *    - Module: ./constraints/stock-feasibility.contract.ts
 *
 * 3. TIME/SLA FEASIBILITY (New)
 *    - Previously deferred; now activated with structural support
 *    - Stage: Feasibility (Phase 1 of optimization)
 *    - Uses: SLATimeState from RuntimeContext
 *    - Candidate provides: CandidateTimeProfile with timing requirements
 *    - Output: TimeFeasibility (yes/no/unknown)
 *    - Module: ./constraints/time-feasibility.contract.ts
 *
 * 4. AVAILABILITY FEASIBILITY (New)
 *    - Previously deferred; now activated with structural support
 *    - Stage: Feasibility (Phase 1 of optimization)
 *    - Uses: AvailabilityState from RuntimeContext
 *    - Candidate provides: CandidateAvailabilityProfile with resource readiness requirements
 *    - Output: AvailabilityFeasibility (yes/no/unknown)
 *    - Module: ./constraints/availability-feasibility.contract.ts
 *
 * CONSTRAINT STAGE CLARIFICATION:
 * - All four new constraints are FEASIBILITY-STAGE (Phase 1, pre-selection)
 * - Applied before selection logic (Phase 2)
 * - Filter candidates from feasible to infeasible
 * - Do NOT participate in tie-breaking or selection ranking
 * - Binary filters only: candidate passes all constraints or is rejected
 * - Selection (objective + tieBreak) applies ONLY to feasible candidates
 *
 * SELECTION EXPANSION:
 * - Selection operates on feasible candidates only (does not expand)
 * - Feasibility filtering is now RUNTIME-AWARE (expands; Phase 1 only)
 * - Selection logic itself remains unchanged (Phase 2)
 * - Constraints are pure pass/fail filters for feasibility, NOT selection criteria
 * - Objective and tieBreak control selection among feasible candidates (unchanged)
 *
 * RUNTIME CONTEXT INTEGRATION:
 * - OptimizationInput now includes optional runtimeContext field
 * - runtimeContext carries: capacity, stock, SLA/time, availability state surfaces
 * - All candidate constraint profiles matched against provided runtime state
 * - If runtime state not provided: constraint evaluation produces "unknown" (not "assume feasible")
 * - No hidden defaults or fallback assumptions
 *
 * DETERMINISM GUARANTEE:
 * - Same candidate + same RuntimeContext + same constraints = same feasibility result
 * - No probabilistic evaluation, no adaptive behavior, no randomness
 * - All constraint evaluation deterministic based on caller-provided values only
 * - No hidden state, no temporal dependencies, no memoization effects
 *
 * FEASIBILITY EVALUATION OUTCOME:
 * - CandidateFeasibilityEvaluation produced for each candidate
 * - Composite of capacity, stock, time, availability outcomes
 * - Each dimension: yes (evaluated and passed), no (evaluated and failed), unknown (not evaluated due to missing runtime state)
 * - Overall: yes (all dimensions yes or null), no (any dimension no), unknown (any dimension unknown)
 * - "unknown" is structural (missing runtime state), not fallback
 * - All outcomes explicit and traceable
 * - Module: ./constraints/feasibility-evaluation.contract.ts
 *
 * OPTIMIZATION FLOW WITH CONSTRAINT EXPANSION:
 * 1. Input: OptimizationInput with runtimeContext (optional)
 * 2. Feasibility Phase (Phase 1):
 *    - For each candidate: evaluate all constraint dimensions
 *    - Capacity feasibility: does candidate fit capacity?
 *    - Stock feasibility: is inventory available?
 *    - Time feasibility: can candidate complete in SLA window?
 *    - Availability feasibility: are resources ready?
 *    - Result: CandidateFeasibilityEvaluation for each candidate
 *    - Filter: keep only candidates with overallFeasible="yes"
 * 3. Selection Phase (Phase 2):
 *    - Only feasible candidates eligible
 *    - Apply objective + tieBreak to select among feasible candidates
 *    - Same selection logic as before (unchanged)
 * 4. Output: OptimizationResult (same contract, now from runtime-aware evaluation)
 *
 * NO FAKE SUPPORT:
 * - Constraint either fully evaluated or explicitly "unknown"
 * - No partial evaluation, no guessing, no fallback assumptions
 * - "unknown" is structural fact: required runtime state not provided (deterministic)
 * - If runtime state not provided → "unknown" (not "assume feasible" or "assume infeasible")
 * - If requirements not in candidate profile → constraint not evaluated (null, not "unknown")
 * - How optimization handles "unknown" at Phase 1 boundary: deterministic implementation responsibility
 * - Possible approaches: fail-safe, pass-through, track separately - but must be explicit/deterministic
 * - Caller sees exactly what was checked, why it was checked, and what was unknown
 *
 * HARD CONSTRAINTS ENFORCED IN EXPANSION:
 * - No generated IDs, no generated timestamps
 * - No Date.now(), no Math.random()
 * - No ML inference, no probabilistic logic
 * - No hidden weights or policy preferences
 * - No execution semantics, no side effects
 * - No classes, no factories, no builders
 * - Strict TypeScript: no any, no suppressions
 * 
 * RUNTIME SUMMARY (Updated):
 * - Phase 1 (Feasibility): Now evaluates base + runtime-aware constraints; deterministic
 * - Phase 2 (Selection): Unchanged; applies to feasible candidates only
 * - Phase 3 (Orchestration): Unchanged; composes phases 1+2
 * - Phase 4 (Domain Specialization): Unchanged; thin adapters available
 * 
 * CLOSURE UPDATE (Phase 8 - Advanced Constraint / Selection Expansion):
 * - Deferred constraint areas now activated with structural support
 * - Runtime-aware feasibility evaluation now supported
 * - Selection remains deterministic and caller-controlled
 * - All constraints are pre-selection filters (Phase 1), not selection criteria
 * - No implicit behavior, no hidden defaults, all outcomes explicit
 * - Optimization layer remains pure computation layer
 * - No real data integration, no persistence, no side effects
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
 * FINAL CLOSURE (Phase 7 + Integration Clarification):
 * - Optimization layer is formally and completely closed
 * - Integration boundaries are explicitly documented in this header
 * - No new integration contracts or framework surfaces
 * - No new capability, no new phases, no expansion of existing phases
 * - All boundaries are clean, responsibility-based, and stable
 * - Export surfaces are responsibility-based and well-organized
 * - Layer is consumption-ready and requires no further modification within this thread
 */

// Foundation and Runtime Contracts
export * from "./contracts/index";
export * from "./constraints/index";

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