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
 */
export async function rebuildVehicleAggregate(
  aggregate: VehicleAggregate
): Promise<VehicleAggregate> {
  return buildVehicleAggregate(aggregate.vehicleId, aggregate.vin, aggregate.plate);
}
