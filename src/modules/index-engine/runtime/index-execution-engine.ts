// GraphIndexAdapter converts Graph artifacts to IndexInput
import { GraphIndexAdapter } from '../domain/adapter/graph-index-adapter';
import { IndexCalculationRunner, type IndexCalculator } from './index-calculation-runner';
import { IndexRecordFactory } from './index-record-factory';
import { IndexPublicationService } from './index-publication-service';
import type { IndexExecutionResult, IndexRuntimeContext, PublicationSourceType } from './contracts';
import { IndexExecutionErrorClass } from './contracts';
import type { IndexInput } from '../domain/input/schemas/index-input';
import type { IndexCalculationResult } from '../domain/calculation/schemas/index-calculation-result';
import type { IndexType } from '../domain/enums/index-type';
import type { IndexCalculationRequest } from '../domain/calculation/schemas/index-calculation-request';
import { IndexSubjectType } from '../domain/enums/index-subject-type';

/**
 * Main execution engine for the Index calculation pipeline
 * Orchestrates: Adapter → Runner → Factory → Publication
 * Provides deterministic, traceable execution
 */
export class IndexExecutionEngine {
  private calculationRunner: IndexCalculationRunner;

  constructor(calculationRunner: IndexCalculationRunner) {
    this.calculationRunner = calculationRunner;
  }

  /**
   * Execute from GraphQueryResult
   * Full integration from Graph artifacts through publication
   */
  async executeFromGraphQuery(
    nodes: unknown[],
    edges: unknown[],
    signals: unknown[],
    graphIndex: unknown | undefined,
    queryResult: unknown,
    vehicleId: string,
    indexType: IndexType,
  ): Promise<IndexExecutionResult> {
    const executionStartTime = Date.now();
    const executionId = this.generateExecutionId('GRAPH_QUERY');
    const sourceType: PublicationSourceType = 'GRAPH_QUERY';
    let indexInput: IndexInput | undefined;

    try {
      // 1. Transform Graph artifacts to IndexInput
      // Graph types are from vehicle-intelligence-graph module (external)
      // We pass unknown[] which GraphIndexAdapter will process and validate
      indexInput = GraphIndexAdapter.fromQuery(
        nodes as any,
        edges as any,
        signals as any,
        graphIndex as any,
        queryResult as any,
        vehicleId,
      ) as IndexInput;

      // 2. Prepare runtime context with properly typed values
      const runtimeContext: IndexRuntimeContext = {
        executionId,
        executedAt: new Date(),
        executionDurationMs: 0, // Will update at step 6
        sourceType,
        indexType,
        vehicleId,
        subjectType: indexInput.subjectType,
      };

      // 3. Execute calculation
      const calculationRequest: IndexCalculationRequest = {
        indexType,
        input: indexInput,
        calculationContext: `execution:${executionId}`,
        requestedAt: new Date(),
        metadata: { sourceType: 'GRAPH_QUERY' },
      };

      const calculationResult = await this.calculationRunner.execute(indexType, calculationRequest);

      // 4. Create IndexRecord
      const indexRecord = IndexRecordFactory.create(calculationResult, indexInput, executionId);

      // 5. Get calculator info
      const calculatorInfo = this.calculationRunner.getCalculatorInfo(indexType) || {
        name: 'unknown',
      };

      // 6. Create publication envelope
      runtimeContext.executionDurationMs = Date.now() - executionStartTime;
      const publicationEnvelope = IndexPublicationService.publish(indexRecord, runtimeContext, calculatorInfo);

      // 7. Return full execution result (success path)
      return {
        success: true,
        runtimeContext,
        indexInput,
        calculationResult,
        indexRecord,
        publicationEnvelope,
      };
    } catch (err) {
      const executionDurationMs = Date.now() - executionStartTime;

      // Return failure result with only context and error details
      return {
        success: false,
        runtimeContext: {
          executionId,
          executedAt: new Date(executionStartTime),
          executionDurationMs,
          sourceType,
          indexType,
          vehicleId,
          subjectType: indexInput?.subjectType || IndexSubjectType.VEHICLE,
        },
        error: {
          code: err instanceof IndexExecutionErrorClass ? err.code : 'UNKNOWN_ERROR',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        },
      };
    }
  }

  /**
   * Execute from Graph artifacts (no QueryResult context)
   * Lower-level API when query result not available
   */
  async executeFromGraphArtifacts(
    nodes: unknown[],
    edges: unknown[],
    signals: unknown[],
    graphIndex: unknown | undefined,
    vehicleId: string,
    indexType: IndexType,
  ): Promise<IndexExecutionResult> {
    const executionStartTime = Date.now();
    const executionId = this.generateExecutionId('GRAPH_ARTIFACTS');
    const sourceType: PublicationSourceType = 'GRAPH_ARTIFACTS';

    let indexInput: IndexInput | undefined;

    try {
      // 1. Transform Graph artifacts to IndexInput
      indexInput = GraphIndexAdapter.fromArtifacts(
        nodes as any,
        edges as any,
        signals as any,
        graphIndex as any,
        vehicleId,
      ) as IndexInput;

      // 2. Prepare runtime context
      const runtimeContext: IndexRuntimeContext = {
        executionId,
        executedAt: new Date(),
        executionDurationMs: 0, // Will update
        sourceType,
        indexType,
        vehicleId,
        subjectType: indexInput.subjectType,
      };

      // 3. Execute calculation
      const calculationRequest: IndexCalculationRequest = {
        indexType,
        input: indexInput,
        calculationContext: `execution:${executionId}`,
        requestedAt: new Date(),
        metadata: { sourceType: 'GRAPH_ARTIFACTS' },
      };

      const calculationResult = await this.calculationRunner.execute(indexType, calculationRequest);

      // 4. Create IndexRecord
      const indexRecord = IndexRecordFactory.create(calculationResult, indexInput, executionId);

      // 5. Get calculator info
      const calculatorInfo = this.calculationRunner.getCalculatorInfo(indexType) || {
        name: 'unknown',
      };

      // 6. Create publication envelope
      runtimeContext.executionDurationMs = Date.now() - executionStartTime;
      const publicationEnvelope = IndexPublicationService.publish(indexRecord, runtimeContext, calculatorInfo);

      // 7. Return full execution result (success path)
      return {
        success: true,
        runtimeContext,
        indexInput,
        calculationResult,
        indexRecord,
        publicationEnvelope,
      };
    } catch (err) {
      const executionDurationMs = Date.now() - executionStartTime;

      // Return failure result with only context and error details
      return {
        success: false,
        runtimeContext: {
          executionId,
          executedAt: new Date(executionStartTime),
          executionDurationMs,
          sourceType,
          indexType,
          vehicleId,
          subjectType: indexInput?.subjectType || IndexSubjectType.VEHICLE,
        },
        error: {
          code: err instanceof IndexExecutionErrorClass ? err.code : 'UNKNOWN_ERROR',
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        },
      };
    }
  }

  /**
   * Generate deterministic execution ID
   */
  private generateExecutionId(sourceType: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `exec_${sourceType}_${timestamp}_${random}`;
  }
}
