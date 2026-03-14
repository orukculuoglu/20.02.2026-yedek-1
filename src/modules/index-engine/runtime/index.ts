/**
 * Index Engine Runtime Module
 * Execution pipeline, publication, and orchestration
 *
 * Key Components:
 * - IndexExecutionEngine: Main orchestration (Graph → Adapter → Runner → Factory → Publication)
 * - IndexCalculationRunner: Calculator registry and execution
 * - IndexRecordFactory: Transforms calculation results into IndexRecords
 * - IndexPublicationService: Publication envelope creation
 * - IndexRuntimeOrchestrator: High-level API for execution
 *
 * Contracts:
 * - IndexExecutionResult: Full execution trace from input to publication
 * - IndexPublicationEnvelope: Publication-ready output
 * - IndexRuntimeContext: Execution context for tracing
 *
 * Validators:
 * - IndexRuntimeValidators: Runtime and publication contract validation
 */

export { IndexExecutionEngine } from './index-execution-engine';
export { IndexCalculationRunner } from './index-calculation-runner';
export { IndexRecordFactory } from './index-record-factory';
export { IndexPublicationService } from './index-publication-service';
export { IndexRuntimeOrchestrator } from './index-runtime-orchestrator';
export {
  type IndexExecutionResult,
  type IndexPublicationEnvelope,
  type IndexRuntimeContext,
  IndexExecutionErrorClass,
} from './contracts';
export { IndexRuntimeValidators } from './index-runtime-validators';
