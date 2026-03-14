import type { IndexInput } from '../domain/input/schemas/index-input';
import type { IndexCalculationResult } from '../domain/calculation/schemas/index-calculation-result';
import type { IndexRecord } from '../domain/schemas/index-record';
import type { IndexType } from '../domain/enums/index-type';
import type { IndexSubjectType } from '../domain/enums/index-subject-type';

/**
 * Publication source type - where the request originated
 */
export type PublicationSourceType = 'GRAPH_QUERY' | 'GRAPH_ARTIFACTS';

/**
 * Runtime execution context for tracing and diagnostics
 * Captures deterministic execution metadata
 */
export interface IndexRuntimeContext {
  executionId: string;
  executedAt: Date;
  executionDurationMs: number;
  sourceType: PublicationSourceType;
  indexType: IndexType;
  vehicleId: string;
  subjectType: IndexSubjectType;
}

/**
 * Publication envelope - structured output for downstream consumers
 * Does not persist to external storage; internal messaging only
 * Contains IndexRecord and complete execution context
 */
export interface IndexPublicationEnvelope {
  publicationId: string;
  publishedAt: Date;
  indexRecord: IndexRecord;
  publicationContext: {
    runtimeId: string;
    sourceType: PublicationSourceType;
    executedAt: Date;
    executionDurationMs: number;
    calculatorName: string;
    calculatorInstance: string;
  };
}

/**
 * Full execution result returned to caller
 * Type-discriminated union: success path has all fields, error path has minimal context
 * Success chain: Graph → IndexInput → CalculationResult → IndexRecord → PublicationEnvelope
 * Error only: provides ExecutionContext + error details
 */
export type IndexExecutionResult = IndexExecutionSuccess | IndexExecutionFailure;

/**
 * Successful execution with all intermediate results
 */
export interface IndexExecutionSuccess {
  success: true;
  runtimeContext: IndexRuntimeContext;
  indexInput: IndexInput;
  calculationResult: IndexCalculationResult;
  indexRecord: IndexRecord;
  publicationEnvelope: IndexPublicationEnvelope;
}

/**
 * Failed execution with context but no intermediate results
 */
export interface IndexExecutionFailure {
  success: false;
  runtimeContext: IndexRuntimeContext;
  error: {
    code: string;
    message: string;
    stack?: string;
  };
}

/**
 * Runtime failure result when execution cannot complete
 * Extends Error with execution context
 */
export class IndexExecutionErrorClass extends Error {
  code: 'CALCULATION_RUNNER_ERROR' | 'ADAPTER_ERROR' | 'FACTORY_ERROR' | 'PUBLICATION_ERROR' | 'UNKNOWN_ERROR';
  runtimeContext?: IndexRuntimeContext;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    code: 'CALCULATION_RUNNER_ERROR' | 'ADAPTER_ERROR' | 'FACTORY_ERROR' | 'PUBLICATION_ERROR' | 'UNKNOWN_ERROR',
  ) {
    super(message);
    this.name = 'IndexExecutionErrorClass';
    this.code = code;
  }
}
