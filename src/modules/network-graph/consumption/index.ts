/**
 * Motor 3 Consumption Surfaces Module
 *
 * Minimal bounded read-only projections of Motor 3 internal outputs.
 * Direct structural exposure only - no enrichment, no reinterpretation, no derived fields.
 *
 * CORE PRINCIPLE: Consumption surfaces = minimal bounded projections of existing internal truth
 * Internal contracts stay internal; consumption surfaces expose them read-only without semantic change.
 *
 * These are NOT new meaning layers, NOT analytics engines, NOT presentation frameworks.
 * All fields exist directly in internal contracts. No field is invented here.
 */

// Export consumption surface contracts
export type {
  OptimizationResultConsumption,
  SelectedActionConsumption,
  RejectedCandidateActionConsumption,
} from "./optimization-result-consumption.contract.js";

export type {
  DecisionOutcomeConsumption,
  ApprovedDecisionConsumption,
  DeferredDecisionConsumption,
  ConfirmedRejectionConsumption,
} from "./decision-outcome-consumption.contract.js";

export type {
  ExecutionBindingConsumption,
  ApprovedActionBindingConsumption,
} from "./execution-binding-consumption.contract.js";

export type {
  RuntimeContextConsumption,
  CapacityStateConsumption,
  CapacityMeasurementConsumption,
  StockStateConsumption,
  StockMeasurementConsumption,
  SLATimeStateConsumption,
  SLAWindowConsumption,
  AvailabilityStateConsumption,
  ResourceAvailabilityConsumption,
} from "./runtime-state-consumption.contract.js";
