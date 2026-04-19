/**
 * Runtime State Contracts - Minimal Foundation
 *
 * SCOPE: Runtime State/Context Foundation - Structural surfaces for runtime-measured conditions
 *
 * Defines structural contracts for runtime state and context:
 * - What capacity state surfaces are needed
 * - What stock state surfaces are needed
 * - What timing state surfaces are needed
 * - What availability/readiness surfaces are needed
 * - How these compose into bounded runtime context
 *
 * ARCHITECTURE:
 * Runtime state surfaces may be consumed by later layers.
 * - Execution/Workflow Binding: produces approved action bindings
 * - Runtime State: carries caller-provided measurements
 * - Later layers: may use state for constraint evaluation, operational decisions, or dispatch
 * - No fixed flow; consuming layers determine usage pattern
 *
 * RUNTIME STATE SURFACES:
 * - Capacity state: resource capacity measurements
 * - Stock state: inventory/stock level measurements
 * - Timing state: timing and SLA information
 * - Availability state: operational readiness measurements
 *
 * BOUNDED CONTEXT COMPOSITION:
 * - RuntimeContext brings together all state surfaces
 * - Optional components (not all states always relevant)
 * - Consuming layers use only what they need
 * - Not a generic metadata bag (bounded to specific state types)
 *
 * HARD CONSTRAINTS:
 * - Strict TypeScript (no any, no ts-ignore, no suppressions)
 * - No generated IDs, no generated timestamps
 * - Deterministic: same input always same output
 * - No real data integration, no persistence
 * - No analytics or reporting
 * - All values caller-provided only
 */

export type { CapacityMeasurement, CapacityState } from "./capacity-state.contract";

export type { StockMeasurement, StockState } from "./stock-state.contract";

export type { SLAWindow, SLATimeState } from "./sla-time-state.contract";

export type {
  ResourceAvailability,
  AvailabilityState,
} from "./availability-state.contract";

export type { RuntimeContext } from "./runtime-context.contract";
