/**
 * Fleet Connector Evaluator Module
 * 
 * Pure deterministic evaluator for normalized fleet records.
 * 
 * Exports:
 * - FleetIntakeEvaluatorRuntimeInput: Input structure for the evaluator
 * - evaluateFleetConnectorIntake: Pure evaluation function
 */

export type {
  FleetIntakeEvaluatorRuntimeInput,
} from './fleet-intake-evaluator.input';

export {
  evaluateFleetConnectorIntake,
} from './fleet-intake-evaluator';
