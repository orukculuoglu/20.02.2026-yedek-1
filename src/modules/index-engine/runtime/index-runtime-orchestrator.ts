import { IndexExecutionEngine } from './index-execution-engine';
import { IndexCalculationRunner, type IndexCalculator } from './index-calculation-runner';
import type { IndexExecutionResult } from './contracts';
import type { IIndexCalculator } from '../domain/calculation/index-calculator';
import type { IndexType } from '../domain/enums/index-type';

/**
 * High-level orchestrator for Index runtime execution
 * Coordinates all components: Adapter → Runner → Engine → Publication
 * Provides convenient methods for both Graph query and artifact paths
 */
export class IndexRuntimeOrchestrator {
  private executionEngine: IndexExecutionEngine;
  private calculationRunner: IndexCalculationRunner;

  constructor() {
    this.calculationRunner = new IndexCalculationRunner();
    this.executionEngine = new IndexExecutionEngine(this.calculationRunner);
  }

  /**
   * Wrap sync domain IIndexCalculator into async runtime IndexCalculator
   */
  private wrapCalculator(domainCalculator: IIndexCalculator): IndexCalculator {
    return {
      calculate: async (request) => domainCalculator.calculate(request),
    };
  }

  /**
   * Register a calculator for an index type
   */
  registerCalculator(indexType: IndexType, calculator: IIndexCalculator): this {
    const wrappedCalculator = this.wrapCalculator(calculator);
    this.calculationRunner.register(indexType, wrappedCalculator);
    return this;
  }

  /**
   * Register multiple calculators
   */
  registerCalculators(calculators: Array<{ indexType: IndexType; calculator: IIndexCalculator }>): this {
    const wrappedCalculators = calculators.map(({ indexType, calculator }) => ({
      indexType,
      calculator: this.wrapCalculator(calculator),
    }));
    this.calculationRunner.registerMultiple(wrappedCalculators);
    return this;
  }

  /**
   * Get available calculator types
   */
  getAvailableCalculators(): IndexType[] {
    return this.calculationRunner.getAvailableTypes() as IndexType[];
  }

  /**
   * Execute from GraphQueryResult
   * Full pipeline: Graph → Adapter → Calculator → Record → Publication
   *
   * Usage:
   * ```ts
   * const result = await orchestrator.executeFromGraphQuery(
   *   nodes, edges, signals, graphIndex, queryResult, vehicleId, indexType
   * );
   * if (result.success) {
   *   console.log(result.publicationEnvelope.indexRecord.score);
   * } else {
   *   console.error(result.error);
   * }
   * ```
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
    return this.executionEngine.executeFromGraphQuery(
      nodes,
      edges,
      signals,
      graphIndex,
      queryResult,
      vehicleId,
      indexType,
    );
  }

  /**
   * Execute from Graph artifacts (no QueryResult)
   * Lower-level API when query context not available
   * Requires explicit indexType specification
   *
   * Usage:
   * ```ts
   * const result = await orchestrator.executeFromGraphArtifacts(
   *   nodes, edges, signals, graphIndex, vehicleId, IndexType.RELIABILITY_INDEX
   * );
   * ```
   */
  async executeFromGraphArtifacts(
    nodes: unknown[],
    edges: unknown[],
    signals: unknown[],
    graphIndex: unknown | undefined,
    vehicleId: string,
    indexType: IndexType,
  ): Promise<IndexExecutionResult> {
    return this.executionEngine.executeFromGraphArtifacts(
      nodes,
      edges,
      signals,
      graphIndex,
      vehicleId,
      indexType,
    );
  }

  /**
   * Get diagnostic info about a specific calculator
   */
  getCalculatorInfo(indexType: string): { name: string; version?: string } | null {
    return this.calculationRunner.getCalculatorInfo(indexType);
  }

  /**
   * Verify all required calculators are registered
   */
  validateCalculatorSetup(requiredTypes: IndexType[]): { valid: boolean; missing: IndexType[] } {
    const available = this.calculationRunner.getAvailableTypes();
    const missing = requiredTypes.filter((type) => !available.includes(type));
    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
