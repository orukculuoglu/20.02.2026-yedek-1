/**
 * Vehicle Intelligence Module - Vehicle Aggregator
 * Orchestrates data sources, risk calculations, and insight generation
 */

import type { VehicleAggregate } from './types';
import { getVehicleDataProvider } from './dataProviders/providerFactory';
import { buildReasonCodes } from './normalizers/reasonCodes';
import { analyzeServiceDiscipline } from './serviceDiscipline';
import { analyzeObdIntelligence } from './obdIntelligence';
import { analyzeInsuranceDamageCorrelation } from './correlationIntelligence';
import {
  detectOdometerAnomaly,
  calculateServiceGapScore,
  calculateStructuralRisk,
  calculateMechanicalRisk,
  calculateInsuranceRisk,
  calculateTrustIndex,
  calculateReliabilityIndex,
  calculateMaintenanceDiscipline,
} from './riskEngine';
import {
  detectRollbackSeverity,
  calculateKmVolatility,
  classifyUsage,
  calculateAvgDailyKm,
} from './kmIntelligence';
import { generateInsight } from './insightGenerator';
import { sendDataEngineEvent } from '../data-engine/ingestion/dataEngineEventSender';
import type { DataEngineEventEnvelope, IndicesUpdatedPayload, VehicleIntelligenceAggregatedPayload } from '../data-engine/contracts/dataEngineEventTypes';

/**
 * Build a complete VehicleAggregate from a vehicle ID
 * Fetches data via provider, computes metrics, and generates insights
 * Provider selection: mock (default) or API via environment variable
 */
export async function buildVehicleAggregate(
  vehicleId: string,
  vin: string,
  plate: string
): Promise<VehicleAggregate> {
  try {
    console.log(`[VehicleAggregator] Building aggregate for ${vehicleId} (${plate})`);

    // STEP 0: Get and log data provider
    const provider = getVehicleDataProvider();
    const providerName = provider.constructor.name;
    console.log(`[VehicleAggregator] DataProvider=${providerName}`);

    // STEP 1: Fetch all data sources via provider
    const dataSources = await provider.fetchAll(vehicleId, vin, plate);
    const { kmHistory, obdRecords, insuranceRecords, damageRecords, serviceRecords } = dataSources;

    console.log(
      `[VehicleAggregator]  - Data sources loaded: KM(${kmHistory.length}), OBD(${obdRecords.length}), Insurance(${insuranceRecords.length}), Damage(${damageRecords.length}), Service(${serviceRecords.length})`
    );

    // STEP 2: Calculate derived metrics
    const odometerAnomaly = detectOdometerAnomaly(kmHistory);
    const rollbackAnalysis = detectRollbackSeverity(kmHistory);
    const volatilityScore = calculateKmVolatility(kmHistory);
    const avgDailyKm = calculateAvgDailyKm(kmHistory);
    const usageClass = classifyUsage(avgDailyKm);
    const kmIntelligence = {
      hasRollback: rollbackAnalysis.hasRollback,
      rollbackSeverity: rollbackAnalysis.severity,
      rollbackEvidenceCount: rollbackAnalysis.evidenceCount,
      volatilityScore,
      usageClass,
    };
    const serviceGapScore = calculateServiceGapScore(serviceRecords);
    const serviceDiscipline = analyzeServiceDiscipline(serviceRecords, kmHistory);
    const obdIntelligence = analyzeObdIntelligence(obdRecords);
    const insuranceDamageCorrelation = analyzeInsuranceDamageCorrelation(
      insuranceRecords,
      damageRecords
    );
    const structuralRisk = calculateStructuralRisk(damageRecords);
    const mechanicalRisk = Math.max(calculateMechanicalRisk(obdRecords), obdIntelligence.severityScore);
    let insuranceRisk = calculateInsuranceRisk(insuranceRecords);
    
    // SOFT INFLUENCE: Apply correlation score
    insuranceRisk = Math.max(insuranceRisk, insuranceDamageCorrelation.correlationScore);
    const adjustedStructuralRisk = Math.max(structuralRisk, insuranceDamageCorrelation.correlationScore * 0.5);

    console.log(
      `[VehicleAggregator]  - Metrics: OdometerAnomaly=${odometerAnomaly}, Rollback=${kmIntelligence.hasRollback}(severity=${kmIntelligence.rollbackSeverity}), Volatility=${volatilityScore}, Usage=${usageClass}, ServiceGap=${serviceGapScore}, Structural=${adjustedStructuralRisk}, Mechanical=${mechanicalRisk}, Insurance=${insuranceRisk}`
    );

    // STEP 3: Calculate intelligence indexes
    const recentServices = serviceRecords.filter((r) => {
      const twoYearsAgo = new Date(
        new Date().getTime() - 2 * 365 * 24 * 60 * 60 * 1000
      );
      return new Date(r.date) >= twoYearsAgo;
    }).length;

    let trustIndex = calculateTrustIndex(
      odometerAnomaly,
      serviceGapScore,
      damageRecords.length,
      insuranceRecords.filter((r) => r.type === 'claim').length,
      insuranceDamageCorrelation
    );

    const reliabilityIndex = calculateReliabilityIndex(
      mechanicalRisk,
      serviceGapScore,
      obdRecords.length,
      recentServices
    );

    const maintenanceDiscipline = calculateMaintenanceDiscipline(
      serviceRecords,
      serviceGapScore,
      odometerAnomaly,
      serviceDiscipline
    );

    console.log(
      `[VehicleAggregator]  - Indexes: Trust=${trustIndex}, Reliability=${reliabilityIndex}, Maintenance=${maintenanceDiscipline}`
    );

    // STEP 4: Create partial aggregate for insight generation
    const partialAggregate: VehicleAggregate = {
      vehicleId,
      vin,
      plate,
      timestamp: new Date().toISOString(),
      dataSources: {
        kmHistory,
        obdRecords,
        insuranceRecords,
        damageRecords,
        serviceRecords,
      },
      derived: {
        odometerAnomaly,
        kmIntelligence,
        serviceGapScore: 100 - serviceDiscipline.timeGapScore, // Inverted for semantics: higher = worse
        serviceDiscipline,
        structuralRisk: adjustedStructuralRisk,
        mechanicalRisk,
        insuranceRisk,
        obdIntelligence,
        insuranceDamageCorrelation,
      },
      indexes: {
        trustIndex,
        reliabilityIndex,
        maintenanceDiscipline,
      },
      insightSummary: '', // Will be filled next
    };

    // STEP 5a: Generate reason codes for explainability
    const reasonCodes = buildReasonCodes({
      odometerAnomaly,
      rollbackSeverity: kmIntelligence.rollbackSeverity,
      volatilityScore,
      serviceGapScore: 100 - serviceDiscipline.timeGapScore, // Inverted for semantics consistency
      serviceDiscipline,
      structuralRisk: adjustedStructuralRisk,
      mechanicalRisk,
      insuranceRisk,
      obdIntelligence,
      insuranceDamageCorrelation,
      dataCounts: {
        km: kmHistory.length,
        service: serviceRecords.length,
        obd: obdRecords.length,
        insurance: insuranceRecords.length,
        damage: damageRecords.length,
      },
    });
    console.log(`[VehicleAggregator] ✓ Reason codes generated`);

    // STEP 5b: Generate insights
    const insightSummary = generateInsight(partialAggregate);
    console.log(`[VehicleAggregator] ✓ Insight generated (${insightSummary.length} chars)`);

    // STEP 6: Return complete aggregate with explainability
    const aggregate: VehicleAggregate = {
      ...partialAggregate,
      insightSummary,
      explain: {
        reasons: reasonCodes,
      },
    };

    console.log(`[VehicleAggregator] ✓ Aggregate complete for ${plate}`);

    // PHASE 9.1: Emit VEHICLE_INTELLIGENCE_AGGREGATED event (lightweight, non-blocking)
    // This summary will be stored in snapshot by reducer
    emitVehicleIntelligenceAggregatedEvent(aggregate).catch((err) => {
      console.error('[VehicleAggregator] Failed to emit VEHICLE_INTELLIGENCE_AGGREGATED:', err);
    });

    return aggregate;
  } catch (error) {
    console.error('[VehicleAggregator] Error building aggregate:', error);

    // Return fallback aggregate with zero/default values
    return {
      vehicleId,
      vin,
      plate,
      timestamp: new Date().toISOString(),
      dataSources: {
        kmHistory: [],
        obdRecords: [],
        insuranceRecords: [],
        damageRecords: [],
        serviceRecords: [],
      },
      derived: {
        odometerAnomaly: false,
        kmIntelligence: {
          hasRollback: false,
          rollbackSeverity: 0,
          rollbackEvidenceCount: 0,
          volatilityScore: 0,
          usageClass: 'normal',
        },
        serviceGapScore: 0,
        serviceDiscipline: {
          timeGapScore: 0,
          kmGapScore: 0,
          regularityScore: 0,
          disciplineScore: 0,
        },
        structuralRisk: 0,
        mechanicalRisk: 0,
        insuranceRisk: 0,
        obdIntelligence: {
          totalFaultCount: 0,
          uniqueFaultCodes: 0,
          categoryBreakdown: {
            engine: 0,
            transmission: 0,
            emission: 0,
            electrical: 0,
            brake: 0,
            other: 0,
          },
          highestSeverity: 'low',
          repeatedFaults: [],
          severityScore: 0,
        },
        insuranceDamageCorrelation: {
          claimCount: 0,
          damageCount: 0,
          matchedEvents: 0,
          mismatchType: 'none',
          correlationScore: 0,
        },
      },
      indexes: {
        trustIndex: 50, // Unknown
        reliabilityIndex: 50,
        maintenanceDiscipline: 50,
      },
      insightSummary: 'Veri toplanırken hata oluştu. Lütfen tekrar deneyiniz.',
    };
  }
}

/**
 * Rebuild an existing aggregate (refresh its calculations)
 * After recalculation, emits domain indices events to update snapshot via pipeline
 */
export async function rebuildVehicleAggregate(
  aggregate: VehicleAggregate
): Promise<VehicleAggregate> {
  // Step 1: Calculate new aggregate
  const refreshed = await buildVehicleAggregate(aggregate.vehicleId, aggregate.vin, aggregate.plate);
  
  // Step 2: Emit domain indices events to trigger snapshot update
  // Fire-and-forget: Does not block UI update
  emitRecalculationEvents(refreshed).catch(err => {
    if (import.meta.env.DEV) {
      console.error('[VehicleAggregator] Failed to emit recalculation events:', err);
    }
  });
  
  return refreshed;
}

/**
 * Emit RISK_INDICES_UPDATED, INSURANCE_INDICES_UPDATED, and PART_INDICES_UPDATED events
 * Called after aggregate recalculation to trigger snapshot pipeline update
 * 
 * These events route through:
 * sendDataEngineEvent() → ingestDataEngineEvent() → vehicleStateReducer → snapshot updated
 * 
 * @param aggregate - Recalculated VehicleAggregate with new indices
 */
export async function emitRecalculationEvents(aggregate: VehicleAggregate): Promise<void> {
  const now = new Date().toISOString();
  const { vehicleId } = aggregate;
  
  // Event 1: RISK_INDICES_UPDATED
  // Maps: trustIndex, reliabilityIndex, maintenanceDiscipline, structuralRisk, mechanicalRisk, serviceGapScore
  const riskIndicesEvent: DataEngineEventEnvelope<IndicesUpdatedPayload> = {
    eventId: `evt-risk-${vehicleId}-${Date.now()}`,
    eventType: 'RISK_INDICES_UPDATED',
    source: 'VEHICLE_INTELLIGENCE',
    vehicleId,
    occurredAt: now,
    tenantId: 'dev',
    schemaVersion: '1.0',
    piiSafe: true,
    payload: {
      indices: [
        { key: 'trustIndex', value: aggregate.indexes.trustIndex, confidence: 75, updatedAt: now },
        { key: 'reliabilityIndex', value: aggregate.indexes.reliabilityIndex, confidence: 75, updatedAt: now },
        { key: 'maintenanceDiscipline', value: aggregate.indexes.maintenanceDiscipline, confidence: 75, updatedAt: now },
        { key: 'structuralRisk', value: aggregate.derived.structuralRisk, confidence: 75, updatedAt: now },
        { key: 'mechanicalRisk', value: aggregate.derived.mechanicalRisk, confidence: 75, updatedAt: now },
        { key: 'serviceGapScore', value: aggregate.derived.serviceGapScore, confidence: 75, updatedAt: now },
      ],
    },
  };
  
  // Event 2: INSURANCE_INDICES_UPDATED
  // Maps: insuranceRisk, correlationScore
  const insuranceIndicesEvent: DataEngineEventEnvelope<IndicesUpdatedPayload> = {
    eventId: `evt-insurance-${vehicleId}-${Date.now()}`,
    eventType: 'INSURANCE_INDICES_UPDATED',
    source: 'VEHICLE_INTELLIGENCE',
    vehicleId,
    occurredAt: now,
    tenantId: 'dev',
    schemaVersion: '1.0',
    piiSafe: true,
    payload: {
      indices: [
        { key: 'insuranceRisk', value: aggregate.derived.insuranceRisk, confidence: 75, updatedAt: now },
        { key: 'claimFrequencyIndex', value: aggregate.derived.insuranceDamageCorrelation.correlationScore, confidence: 75, updatedAt: now },
      ],
    },
  };
  
  // Event 3: PART_INDICES_UPDATED
  // Note: Part domain logic is currently fragmented (in services/dataEngineIndices.ts)
  // Emitting placeholder for now - will be populated once part domain is modularized
  const partIndicesEvent: DataEngineEventEnvelope<IndicesUpdatedPayload> = {
    eventId: `evt-part-${vehicleId}-${Date.now()}`,
    eventType: 'PART_INDICES_UPDATED',
    source: 'VEHICLE_INTELLIGENCE',
    vehicleId,
    occurredAt: now,
    tenantId: 'dev',
    schemaVersion: '1.0',
    piiSafe: true,
    payload: {
      indices: [
        // Placeholder indices - to be filled when part domain engine is reconstructed
        { key: 'partAvailability', value: 50, confidence: 50, updatedAt: now },
      ],
    },
  };
  
  // Send all three events in parallel (fire-and-forget)
  try {
    await Promise.all([
      sendDataEngineEvent(riskIndicesEvent),
      sendDataEngineEvent(insuranceIndicesEvent),
      sendDataEngineEvent(partIndicesEvent),
    ]);
    
    if (import.meta.env.DEV) {
      console.debug('[VehicleAggregator] ✓ Recalculation events emitted (RISK, INSURANCE, PART indices updated)');
    }
  } catch (error) {
    throw error; // Will be caught by caller's .catch()
  }
}

/**
 * PHASE 9.1: Emit VEHICLE_INTELLIGENCE_AGGREGATED event
 * Lightweight summary of vehicle intelligence analysis
 * Emitted after aggregate build completes
 * 
 * This event:
 * - Contains composite scores and domain-specific risk metrics
 * - Is stored in snapshot.vehicleIntelligenceSummary by reducer
 * - Does NOT block event ingestion or UI rendering
 * - Fire-and-forget: Failures are logged but don't propagate
 * 
 * @param aggregate - Completed VehicleAggregate with all calculations
 */
async function emitVehicleIntelligenceAggregatedEvent(aggregate: VehicleAggregate): Promise<void> {
  const now = new Date().toISOString();
  const { vehicleId } = aggregate;
  
  // Calculate composite score from indices
  const compositeScore = Math.round(
    (aggregate.indexes.trustIndex +
     aggregate.indexes.reliabilityIndex +
     aggregate.indexes.maintenanceDiscipline) / 3
  );
  
  // Determine composite level
  let compositeLevel = 'low-risk';
  if (compositeScore >= 70) {
    compositeLevel = 'high-risk';
  } else if (compositeScore >= 50) {
    compositeLevel = 'medium-risk';
  }
  
  // Count data sources
  const dataSourceCount = Object.values(aggregate.dataSources).reduce(
    (total, arr) => total + (Array.isArray(arr) ? arr.length : 0),
    0
  );
  
  // Build lightweight payload
  const payload: VehicleIntelligenceAggregatedPayload = {
    compositeScore,
    compositeLevel,
    trustIndex: aggregate.indexes.trustIndex,
    reliabilityIndex: aggregate.indexes.reliabilityIndex,
    maintenanceDiscipline: aggregate.indexes.maintenanceDiscipline,
    structuralRisk: aggregate.derived.structuralRisk,
    mechanicalRisk: aggregate.derived.mechanicalRisk,
    insuranceRisk: aggregate.derived.insuranceRisk,
    serviceGapScore: aggregate.derived.serviceGapScore,
    dataSourceCount,
    confidence: 75, // Default confidence from aggregate calculations
    analysisTimestamp: aggregate.timestamp,
    aggregatedAt: now,
  };
  
  // Create event envelope
  const event: DataEngineEventEnvelope<VehicleIntelligenceAggregatedPayload> = {
    eventId: `evt-agg-${vehicleId}-${Date.now()}`,
    eventType: 'VEHICLE_INTELLIGENCE_AGGREGATED',
    source: 'AUTO_EKSPERTIZ',
    vehicleId,
    occurredAt: now,
    tenantId: 'dev',
    schemaVersion: '1.0',
    piiSafe: true,
    payload,
  };
  
  // Emit event (fire-and-forget)
  try {
    await sendDataEngineEvent(event);
    
    if (import.meta.env.DEV) {
      console.debug('[VehicleAggregator] ✓ VEHICLE_INTELLIGENCE_AGGREGATED event emitted', {
        vehicleId,
        compositeScore,
        compositeLevel,
        dataSourceCount,
      });
    }
  } catch (error) {
    console.error('[VehicleAggregator] Failed to emit VEHICLE_INTELLIGENCE_AGGREGATED:', error);
  }
}
