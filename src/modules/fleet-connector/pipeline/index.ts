/**
 * Fleet Connector Evaluation Pipeline Module
 * 
 * Pure deterministic pipeline that composes the intake evaluator and
 * routing orchestrator to transform normalized vehicles into service
 * routing requests.
 * 
 * Exports:
 * - FleetConnectorEvaluationPipelineRuntimeInput: Input structure for the pipeline
 * - FleetConnectorEvaluationPipelineStatus: Outcome status enumeration
 * - FleetConnectorEvaluationPipelineResult: Result structure
 * - runFleetConnectorEvaluationPipeline: Pipeline composition function
 */

export type {
  FleetConnectorEvaluationPipelineRuntimeInput,
} from './fleet-connector-evaluation-pipeline.input';

export {
  FleetConnectorEvaluationPipelineStatus,
} from './fleet-connector-evaluation-pipeline.result';

export type {
  FleetConnectorEvaluationPipelineResult,
} from './fleet-connector-evaluation-pipeline.result';

export {
  runFleetConnectorEvaluationPipeline,
} from './fleet-connector-evaluation-pipeline';
