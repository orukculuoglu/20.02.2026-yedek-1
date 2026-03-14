/**
 * Index Runtime Execution Examples
 *
 * Demonstrates complete pipeline execution for each calculator type
 * Graph artifacts → IndexInput → Calculation → IndexRecord → Publication
 */

import { IndexRuntimeOrchestrator } from './index-runtime-orchestrator';
import { IndexPublicationService } from './index-publication-service';
import type { IndexExecutionResult } from './contracts';
import { IndexType } from '../domain/enums/index-type';
import { IndexBand } from '../domain/enums/index-band';
import { IndexSubjectType } from '../domain/enums/index-subject-type';

/**
 * Example 1: Reliability Index Execution
 *
 * Demonstrates:
 * - Graph query result handling
 * - Reliability calculator registration
 * - Full pipeline execution
 * - Publication envelope generation
 */
export async function exampleReliabilityExecution(): Promise<void> {
  console.log('\n=== Example: Reliability Index Execution ===\n');

  // Setup orchestrator with calculators
  const orchestrator = new IndexRuntimeOrchestrator();

  // Register all calculators (in real app, these are imported from calculators module)
  // orchestrator.registerCalculators([
  //   { indexType: 'RELIABILITY', calculator: new ReliabilityCalculator() },
  //   { indexType: 'MAINTENANCE', calculator: new MaintenanceCalculator() },
  //   // ... other calculators
  // ]);

  // Verify setup
  const validation = orchestrator.validateCalculatorSetup([
    IndexType.RELIABILITY_INDEX,
    IndexType.MAINTENANCE_INDEX,
    IndexType.INSURANCE_RISK_INDEX,
    IndexType.OPERATIONAL_READINESS_INDEX,
    IndexType.DATA_QUALITY_INDEX,
  ]);

  console.log(`Calculators registered: ${validation.valid ? 'OK' : 'MISSING'}`);
  if (!validation.valid) {
    console.log(`Missing: ${validation.missing.join(', ')}`);
    return;
  }

  // Create sample graph data (in real app, comes from query)
  const mockNodes = [
    // { ...GraphNode sample data }
  ];
  const mockEdges = [
    // { ...GraphEdge sample data }
  ];
  const mockSignals = [
    // { ...GraphSignal sample data }
  ];
  const mockQueryResult = {
    queryId: 'q_001',
    queryType: 'RELIABILITY',
    // ...
  };

  // Execute from graph query
  // const result = await orchestrator.executeFromGraphQuery(
  //   mockNodes,
  //   mockEdges,
  //   mockSignals,
  //   undefined,
  //   mockQueryResult as any,
  //   'VIN123456789'
  // );

  // Demonstrate result structure (success path)
  const demonstrationResult: IndexExecutionResult = {
    success: true,
    runtimeContext: {
      executionId: 'exec_GRAPH_QUERY_1234567890_1234',
      executedAt: new Date(),
      executionDurationMs: 245,
      sourceType: 'GRAPH_QUERY',
      indexType: IndexType.RELIABILITY_INDEX,
      vehicleId: 'VIN123456789',
      subjectType: IndexSubjectType.VEHICLE,
    },
    indexInput: undefined as any, // Omitted for brevity
    calculationResult: undefined as any, // Omitted for brevity
    indexRecord: {
      indexId: 'RELIABILITY_INDEX:VIN123456789:1234567890000',
      indexType: IndexType.RELIABILITY_INDEX,
      subjectType: IndexSubjectType.VEHICLE,
      subjectId: 'VIN123456789',
      score: 0.847,
      band: IndexBand.HIGH,
      confidence: 0.92,
      calculatedAt: new Date(),
      validAt: new Date(),
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      explanation: {
        summary: 'Vehicle reliability is strong based on maintenance history and signal patterns',
        positiveFactors: ['Low failure rate', 'Regular maintenance', 'Good component health'],
        negativeFactors: ['Minor wear patterns'],
        recommendedActions: ['Continue regular maintenance schedule'],
      },
      metadata: {
        eventCount: 45,
        sourceCount: 3,
        calculationModel: 'IndexEngine/v1.0.0',
        dataFreshnessInDays: 2,
      },
    },
    publicationEnvelope: {
      publicationId: 'pub_RELIABILITY_INDEX_VIN12345_1234567890_0001',
      publishedAt: new Date(),
      indexRecord: {
        indexId: 'RELIABILITY_INDEX:VIN123456789:1234567890000',
        indexType: IndexType.RELIABILITY_INDEX,
        subjectType: IndexSubjectType.VEHICLE,
        subjectId: 'VIN123456789',
        score: 0.847,
        band: IndexBand.HIGH,
        confidence: 0.92,
        calculatedAt: new Date(),
        validAt: new Date(),
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        explanation: {
          summary: 'Vehicle reliability is strong based on maintenance history and signal patterns',
          positiveFactors: ['Low failure rate', 'Regular maintenance', 'Good component health'],
          negativeFactors: ['Minor wear patterns'],
          recommendedActions: ['Continue regular maintenance schedule'],
        },
        metadata: {
          eventCount: 45,
          sourceCount: 3,
          calculationModel: 'IndexEngine/v1.0.0',
          dataFreshnessInDays: 2,
        },
      },
      publicationContext: {
        runtimeId: 'exec_GRAPH_QUERY_1234567890_1234',
        sourceType: 'GRAPH_QUERY',
        executedAt: new Date(),
        executionDurationMs: 245,
        calculatorName: 'ReliabilityCalculator',
        calculatorInstance: '1.0.0',
      },
    },
  };

  // Display results
  if (demonstrationResult.success) {
    const summary = IndexPublicationService.summarize(demonstrationResult.publicationEnvelope);
    console.log(`\nExecution Result:`);
    console.log(`  ${summary}`);
    console.log(`\nIndexRecord:`);
    console.log(`  Score: ${demonstrationResult.publicationEnvelope.indexRecord.score}`);
    console.log(`  Band: ${demonstrationResult.publicationEnvelope.indexRecord.band}`);
    console.log(`  Confidence: ${demonstrationResult.publicationEnvelope.indexRecord.confidence}`);
  } else {
    console.error(`Execution failed: ${demonstrationResult.runtimeContext.indexType}`);
  }
}

/**
 * Example 2: Maintenance Index Execution
 *
 * Demonstrates:
 * - Graph artifacts path (no QueryResult)
 * - Maintenance calculator execution
 * - Error handling
 */
export async function exampleMaintenanceExecution(): Promise<void> {
  console.log('\n=== Example: Maintenance Index Execution ===\n');

  const orchestrator = new IndexRuntimeOrchestrator();

  // Would register calculators here
  // orchestrator.registerCalculators([...]);

  // Execute from graph artifacts (lower-level API)
  console.log(`Execution path: Graph Artifacts → MAINTENANCE Calculator`);
  console.log(`Demonstrating error handling when calculator not registered...`);

  // const result = await orchestrator.executeFromGraphArtifacts(
  //   mockNodes,
  //   mockEdges,
  //   mockSignals,
  //   mockIndex,
  //   'VIN987654321',
  //   'MAINTENANCE'
  // );

  // Demonstrate error result
  const errorResult: IndexExecutionResult = {
    success: false,
    runtimeContext: {
      executionId: 'exec_GRAPH_ARTIFACTS_1234567890_5678',
      executedAt: new Date(),
      executionDurationMs: 45,
      sourceType: 'GRAPH_ARTIFACTS',
      indexType: IndexType.MAINTENANCE_INDEX,
      vehicleId: 'VIN987654321',
      subjectType: IndexSubjectType.VEHICLE,
    },
    error: {
      code: 'CALCULATION_RUNNER_ERROR',
      message: 'No calculator registered for IndexType: MAINTENANCE_INDEX. Available: ',
    },
  };

  console.log(`\nError Response:`);
  console.log(`  Code: ${errorResult.error.code}`);
  console.log(`  Message: ${errorResult.error.message}`);
  console.log(`\nSolution: Ensure calculator is registered before execution`);
}

/**
 * Example 3: Insurance Index Execution
 *
 * Demonstrates:
 * - Full publication envelope structure
 * - Downstream message extraction
 * - Traceability and metadata preservation
 */
export async function exampleInsuranceExecution(): Promise<void> {
  console.log('\n=== Example: Insurance Index Execution ===\n');

  // Create demonstration publication envelope
  const envelope = {
    publicationId: 'pub_INSURANCE_RISK_INDEX_VIN98765_1234567890_0001',
    publishedAt: new Date(),
    indexRecord: {
      indexId: 'INSURANCE_RISK_INDEX:VIN987654321:1234567890000',
      indexType: IndexType.INSURANCE_RISK_INDEX,
      subjectType: IndexSubjectType.VEHICLE,
      subjectId: 'VIN987654321',
      score: 0.724,
      band: IndexBand.MEDIUM,
      confidence: 0.88,
      calculatedAt: new Date(),
      explanation: {
        summary: 'Insurance risk profile reflects moderate maintenance history and recent signal spikes',
        positiveFactors: ['Stable operation', 'No recent alerts'],
        negativeFactors: ['Aging components', 'Recent signal anomalies'],
        recommendedActions: ['Review component aging', 'Schedule preventive maintenance'],
      },
      validAt: new Date(),
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metadata: {
        eventCount: 78,
        sourceCount: 4,
        calculationModel: 'IndexEngine/v1.0.0',
        dataFreshnessInDays: 1,
      },
    },
    publicationContext: {
      runtimeId: 'exec_GRAPH_QUERY_1234567890_5678',
      sourceType: 'GRAPH_QUERY' as const,
      executedAt: new Date(),
      executionDurationMs: 312,
      calculatorName: 'InsuranceCalculator',
      calculatorInstance: '1.0.0',
    },
  };
  console.log(`Publication Envelope Structure:`);
  console.log(`  publicationId: ${envelope.publicationId}`);
  console.log(`  publishedAt: ${envelope.publishedAt.toISOString()}`);

  // Extract downstream-ready message
  const downstreamMsg = IndexPublicationService.toDownstreamMessage(envelope);
  console.log(`\nDownstream Message (for queuing/transmission):`);
  console.log(`  publicationId: ${downstreamMsg.publicationId}`);
  console.log(`  publishedAt: ${downstreamMsg.publishedAt}`);
  console.log(`  sourceType: ${downstreamMsg.sourceType}`);
  console.log(`  executionDurationMs: ${downstreamMsg.executionDurationMs}`);
  console.log(`  indexRecord.score: ${downstreamMsg.indexRecord.score}`);

  // Show traceability
  console.log(`\nTraceability:`);
  console.log(`  Execution ID: ${envelope.publicationContext.runtimeId}`);
  console.log(`  Calculator: ${envelope.publicationContext.calculatorName}`);
  console.log(`  Duration: ${envelope.publicationContext.executionDurationMs}ms`);
  console.log(`  Data Freshness: ${envelope.indexRecord.metadata.dataFreshnessInDays} days`);
}

/**
 * Example 4: Operational Readiness Index Execution
 *
 * Demonstrates:
 * - Multiple calculator registration
 * - Validation before execution
 * - Execution diagnostics
 */
export async function exampleOperationalReadinessExecution(): Promise<void> {
  console.log('\n=== Example: Operational Readiness Index Execution ===\n');

  const orchestrator = new IndexRuntimeOrchestrator();

  // Demonstrate setup validation
  console.log(`Setup Validation:`);
  const requiredCalculators = [
    IndexType.RELIABILITY_INDEX,
    IndexType.MAINTENANCE_INDEX,
    IndexType.INSURANCE_RISK_INDEX,
    IndexType.OPERATIONAL_READINESS_INDEX,
    IndexType.DATA_QUALITY_INDEX,
  ];
  const validation = orchestrator.validateCalculatorSetup(requiredCalculators);

  console.log(`  Required: ${requiredCalculators.join(', ')}`);
  console.log(`  Registered: ${orchestrator.getAvailableCalculators().join(', ') || '(none)'}`);
  console.log(`  Valid Setup: ${validation.valid ? 'YES' : 'NO'}`);

  if (!validation.valid) {
    console.log(`  Missing Calculators:`);
    for (const missing of validation.missing) {
      console.log(`    - ${missing}`);
    }
  }

  console.log(`\nOperational Readiness Calculation:`);
  console.log(`  Combines:`);
  console.log(`    - Reliability (weight: 35%)`);
  console.log(`    - Maintenance (weight: 30%)`);
  console.log(`    - Data Quality (weight: 20%)`);
  console.log(`    - Insurance Risk (weight: 15%)`);

  console.log(`\nExpected Index Record:`);
  console.log(`  Score: 0.765 (composite 35% + 30% + 20% + 15%)`);
  console.log(`  Band: GOOD`);
  console.log(`  Confidence: 0.89 (min of component confidences)`);
  console.log(`  Duration: ~450-550ms (sum of component executions)`);
}

/**
 * Example 5: Data Quality Index Execution
 *
 * Demonstrates:
 * - Publication envelope logging
 * - Execution diagnostics output
 * - Ready for downstream consumers
 */
export async function exampleDataQualityExecution(): Promise<void> {
  console.log('\n=== Example: Data Quality Index Execution ===\n');

  // Create demonstration publication envelope
  const envelope = {
    publicationId: 'pub_DATA_QUALITY_INDEX_GRAPH_1234567890_0001',
    publishedAt: new Date(),
    indexRecord: {
      indexId: 'DATA_QUALITY_INDEX:GRAPH_ANALYSIS:1234567890000',
      indexType: IndexType.DATA_QUALITY_INDEX,
      subjectType: IndexSubjectType.VEHICLE,
      subjectId: 'GRAPH_ANALYSIS',
      score: 0.891,
      band: IndexBand.OPTIMAL,
      confidence: 0.95,
      calculatedAt: new Date(),
      explanation: {
        summary: 'High-quality data with comprehensive coverage, minimal missing data, and strong provenance',
        positiveFactors: ['Comprehensive data points (2847)', 'High completeness (94.2%)', 'Strong provenance (0.92)'],
        negativeFactors: [],
        recommendedActions: ['Maintain data quality standards', 'Continue data collection from 12 sources'],
      },
      validAt: new Date(),
      validFrom: new Date(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metadata: {
        eventCount: 2847,
        sourceCount: 12,
        calculationModel: 'IndexEngine/v1.0.0',
        dataFreshnessInDays: 0,
      },
    },
    publicationContext: {
      runtimeId: 'exec_GRAPH_QUERY_1234567890_9999',
      sourceType: 'GRAPH_QUERY' as const,
      executedAt: new Date(),
      executionDurationMs: 189,
      calculatorName: 'DataQualityCalculator',
      calculatorInstance: '1.0.0',
    },
  };

  // Generate summary
  const summary = IndexPublicationService.summarize(envelope);
  console.log(`Publication Summary:\n${summary}\n`);

  console.log(`Detailed Metrics:`);
  console.log(`  Data Points (Event Count): ${envelope.indexRecord.metadata.eventCount}`);
  console.log(`  Data Sources: ${envelope.indexRecord.metadata.sourceCount}`);
  console.log(`  Data Freshness: ${envelope.indexRecord.metadata.dataFreshnessInDays} days`);
  console.log(`  Calculation Model: ${envelope.indexRecord.metadata.calculationModel}`);

  console.log(`\nValidity Window:`);
  console.log(`  Valid At: ${envelope.indexRecord.validAt.toISOString()}`);
  console.log(`  Valid From: ${envelope.indexRecord.validFrom.toISOString()}`);
  console.log(`  Valid To: ${envelope.indexRecord.validTo.toISOString()}`);

  console.log(`\nReady for downstream consumers (no external persistence):`);
  console.log(`  - Event bus topic: index-records/DATA_QUALITY`);
  console.log(`  - Cache key: ${envelope.publicationId}`);
  console.log(`  - Event timestamp: ${envelope.publishedAt.toISOString()}`);
}

/**
 * Run all examples
 */
export async function runAllExamples(): Promise<void> {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        Index Runtime Execution Examples (All Types)       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await exampleReliabilityExecution();
  await exampleMaintenanceExecution();
  await exampleInsuranceExecution();
  await exampleOperationalReadinessExecution();
  await exampleDataQualityExecution();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              Runtime Execution Examples Complete          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}
