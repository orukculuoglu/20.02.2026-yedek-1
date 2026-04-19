/**
 * Advanced Constraint / Selection Expansion - Constraints Module Index
 *
 * SCOPE:
 * This module provides structural support for runtime-aware constraint and selection expansion
 * within the optimization layer (Motor 3, Phase: Advanced Constraint / Selection Expansion).
 *
 * Activates previously deferred runtime-aware constraint areas:
 * - Capacity feasibility (from CapacityState)
 * - Stock feasibility (from StockState)
 * - Time/SLA feasibility (from SLATimeState)
 * - Availability feasibility (from AvailabilityState)
 *
 * ARCHITECTURE:
 * - Feasibility-stage constraints only (pre-selection filtering)
 * - Independent evaluation for each constraint dimension
 * - Composite feasibility evaluation for candidate assessment
 * - All constraints deterministic, explicit, traceable
 * - No hidden behavior, no fallback logic, no generated values
 *
 * CONSTRAINT ACTIVATION DETAILS:
 *
 * 1. CAPACITY FEASIBILITY (Previously Deferred)
 *    - Now activated with explicit structural support
 *    - Stage: Feasibility (Phase 1 of optimization)
 *    - Uses: CapacityState from RuntimeContext
 *    - Evaluates: does candidate exceed available capacity?
 *    - Candidate provides: CandidateCapacityProfile with requirements
 *    - Output: CapacityFeasibility (yes/no/unknown)
 *    - No execution, no allocation, no persistence
 *
 * 2. STOCK FEASIBILITY (Previously Deferred)
 *    - Now activated with explicit structural support
 *    - Stage: Feasibility (Phase 1 of optimization)
 *    - Uses: StockState from RuntimeContext
 *    - Evaluates: does candidate require unavailable inventory?
 *    - Candidate provides: CandidateStockProfile with requirements
 *    - Output: StockFeasibility (yes/no/unknown)
 *    - No execution, no allocation, no persistence
 *
 * 3. TIME/SLA FEASIBILITY (Previously Deferred)
 *    - Now activated with explicit structural support
 *    - Stage: Feasibility (Phase 1 of optimization)
 *    - Uses: SLATimeState from RuntimeContext
 *    - Evaluates: can candidate complete within timing window?
 *    - Candidate provides: CandidateTimeProfile with requirements
 *    - Output: TimeFeasibility (yes/no/unknown)
 *    - No time generation, no system clock, no real integration
 *
 * 4. AVAILABILITY FEASIBILITY (Previously Deferred)
 *    - Now activated with explicit structural support
 *    - Stage: Feasibility (Phase 1 of optimization)
 *    - Uses: AvailabilityState from RuntimeContext
 *    - Evaluates: are required resources available and ready?
 *    - Candidate provides: CandidateAvailabilityProfile with requirements
 *    - Output: AvailabilityFeasibility (yes/no/unknown)
 *    - No monitoring, no live polling, no real integration
 *
 * CONSTRAINT STAGE CLARIFICATION:
 * All four constraint areas are FEASIBILITY-STAGE (Phase 1):
 * - Applied before selection logic (Phase 2)
 * - Filter candidates from feasible to infeasible
 * - Do NOT participate in tie-breaking or selection ranking
 * - All are binary filters: candidate either passes or fails
 * - Selection (objective + tieBreak) applies ONLY to feasible candidates
 *
 * SELECTION EXPANSION HONESTY:
 * - Selection can now be runtime-aware (using feasible candidates)
 * - But selection logic itself remains caller responsibility
 * - Optimization defines feasibility support, not selection algorithm
 * - No hidden selection ranking or preference logic in constraints
 * - Constraints are pure pass/fail filters, nothing more
 *
 * DETERMINISM GUARANTEE:
 * - Same candidate + same RuntimeContext + same constraints = same feasibility
 * - No probabilistic evaluation, no adaptive behavior, no randomness
 * - No hidden state, no memoization with side effects, no temporal dependencies
 * - All constraint evaluation deterministic based on caller-provided values only
 *
 * HARD CONSTRAINTS ENFORCED:
 * - No generated IDs, no generated timestamps
 * - No Date.now(), no Math.random()
 * - No ML inference, no probabilistic logic
 * - No hidden weights or preferences
 * - No policy override or exception logic
 * - No execution semantics, no side effects
 * - No classes, no factories, no builders
 * - No hidden defaults or assumptions
 * - Strict TypeScript: no any, no suppressions
 *
 * INTEGRATION PATTERN:
 * 1. Candidate includes CompleteConstraintProfile (or subset)
 * 2. OptimizationInput includes optional RuntimeContext
 * 3. Feasibility evaluator processes candidates using constraints + context
 * 4. Each candidate produces CandidateFeasibilityEvaluation
 * 5. Optimization Phase 1 filters: keep only feasible candidates
 * 6. Optimization Phase 2 (selection) applies to feasible candidates only
 * 7. Result: OptimizationResult with selected and rejected (maintains Phase 3 semantics)
 *
 * NO FAKE SUPPORT:
 * - Constraint is either fully evaluated or explicitly "unknown"
 * - No guessing, no partial evaluation, no fallback assumptions
 * - "unknown" is structural: required runtime state not provided (deterministic)
 * - If runtime state not provided → "unknown" (not "assume feasible" or "assume infeasible")
 * - If requirements not specified → constraint not evaluated (null, not "unknown")
 * - How optimization handles "unknown": deterministic implementation responsibility (fail-safe/pass-through/track separately)
 * - Caller sees exactly what was checked, why, and what was unknown
 *
 * EXPORTS:
 * - CapacityFeasibility, CapacityRequirement, CandidateCapacityProfile
 * - StockFeasibility, StockRequirement, CandidateStockProfile
 * - TimeFeasibility, TimeRequirement, CandidateTimeProfile
 * - AvailabilityFeasibility, AvailabilityRequirement, CandidateAvailabilityProfile
 * - CandidateFeasibilityEvaluation, CompleteConstraintProfile
 */

export type {
  CapacityFeasibility,
  CapacityRequirement,
  CandidateCapacityProfile,
} from "./capacity-feasibility.contract";

export type {
  StockFeasibility,
  StockRequirement,
  CandidateStockProfile,
} from "./stock-feasibility.contract";

export type {
  TimeFeasibility,
  TimeRequirement,
  CandidateTimeProfile,
} from "./time-feasibility.contract";

export type {
  AvailabilityFeasibility,
  AvailabilityRequirement,
  CandidateAvailabilityProfile,
} from "./availability-feasibility.contract";

export type {
  CandidateFeasibilityEvaluation,
  CompleteConstraintProfile,
} from "./feasibility-evaluation.contract";
