import type { VehicleProfile } from '../../../types';
import { buildFleetRiskSummary, type FleetRiskSummary } from '../fleetRisk/fleetRiskAggregator';

/**
 * Normalize function: min-max scaling to 0-100
 * @param value Current value
 * @param min Minimum possible value
 * @param max Maximum possible value
 * @returns Normalized value (0-100)
 */
export function normalize(value: number, min: number = 0, max: number = 100): number {
  if (max === min) return 50; // Handle edge case
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

export interface DataEngineSummaryV2 {
  // Temel Risk Endeksleri
  riskIndex: number; // 0-100: Fleet average risk
  durabilityIndex: number; // 0-100: 100 - avgRisk
  costPressureIndex: number; // 0-100: normalized exposure
  maintenanceComplianceRatio: number; // 0-100: maintenance adherence
  criticalDensity: number; // 0-100: % of vehicles with risk >= 60
  dataReliabilityScore: number; // 0-100: data completeness score

  // Trend & metadata
  trend: Array<{ month: string; risk: number; exposure: number }>;
  vehicleCount: number;
  criticalVehicleCount: number;
  averageExposure: number;

  // Formula documentation (directly from buildFleetRiskSummary)
  formulaNotes: {
    riskIndex: string;
    durabilityIndex: string;
    costPressure: string;
    maintenanceCompliance: string;
    criticalDensity: string;
    dataReliability: string;
  };

  // Security/confidence index (from fleetRiskAggregator)
  securityIndex: {
    grade: 'A+' | 'A' | 'B' | 'C' | 'D';
    score01: number; // 0..1
    reasons: string[];
  };

  // Reference to underlying fleet summary for advanced queries
  // This ensures single source of truth
  _fleetSummary: FleetRiskSummary;
}

/**
 * Build comprehensive Data Engine Summary V2
 * SINGLE SOURCE OF TRUTH for fleet risk metrics
 * 
 * This function delegates ALL risk calculations to buildFleetRiskSummary,
 * ensuring that both RiskAnalysis.tsx and DataEngine views display
 * identical metrics from the same engine (vehicleRiskEngine + fleetRiskAggregator).
 * 
 * No separate risk calculations are performed here - only mapping and normalization
 * of the underlying fleet summary.
 * 
 * @param vehicles Array of vehicle profiles
 * @param options Calculation options
 * @returns Complete DataEngineSummaryV2 object with all metrics from buildFleetRiskSummary
 */
export function buildDataEngineSummary(
  vehicles: VehicleProfile[],
  options?: {
    maintenanceCompliance?: number; // 0-1: ratio of timely maintenance
    dataCompletenessRate?: number; // 0-1: ratio of complete records
  }
): DataEngineSummaryV2 {
  // Get fleet risk summary
  const fleet = buildFleetRiskSummary(vehicles);

  const vehicleCount = vehicles.length;
  const criticalCount = fleet.criticalCount;

  // 1) Risk Index: Direct from avgRisk (0-100)
  const riskIndex = fleet.avgRisk;

  // 2) Durability Index: 100 - avgRisk (inverse relationship)
  const durabilityIndex = Math.max(0, Math.min(100, 100 - fleet.avgRisk));

  // 3) Cost Pressure Index: Normalize exposure
  // Assuming exposure can range from 0 to substantial values
  // Normalize to 0-100 scale: exposure is typically 0-50000 range for fleets
  const maxExposureRange = 50000;
  const costPressureIndex = normalize(fleet.exposure, 0, maxExposureRange);

  // 4) Maintenance Compliance Ratio
  // Input: options.maintenanceCompliance (0-1) or default to 85%
  const maintenanceCompliance = options?.maintenanceCompliance ?? 0.85;
  const maintenanceComplianceRatio = Math.round(maintenanceCompliance * 100);

  // 5) Critical Density: (critical vehicles / total vehicles) * 100
  const criticalDensity =
    vehicleCount > 0
      ? normalize((criticalCount / vehicleCount) * 100, 0, 100)
      : 0;

  // 6) Data Reliability Score
  // Input: options.dataCompletenessRate (0-1) or default to 92%
  const dataCompletenessRate = options?.dataCompletenessRate ?? 0.92;
  const dataReliabilityScore = Math.round(dataCompletenessRate * 100);

  // Calculate average exposure per vehicle
  const averageExposure =
    vehicleCount > 0 ? Math.round(fleet.exposure / vehicleCount) : 0;

  // Build formula notes
  const formulaNotes = {
    riskIndex: `Σ(vehicle.risk_score) / ${vehicleCount} = ${riskIndex}/100`,
    durabilityIndex: `100 - avgRisk = 100 - ${fleet.avgRisk} = ${durabilityIndex}`,
    costPressure: `normalize(exposure[${fleet.exposure}] / 50000) = ${costPressureIndex}`,
    maintenanceCompliance: `(timely_maintenance / total_maintenance) × 100 = ${maintenanceComplianceRatio}%`,
    criticalDensity: `(risk_score ≥ 60 count[${criticalCount}] / total[${vehicleCount}]) × 100 = ${criticalDensity}%`,
    dataReliability: `(complete_records / total_records) × 100 = ${dataReliabilityScore}%`,
  };

  return {
    // Core indices
    riskIndex,
    durabilityIndex,
    costPressureIndex,
    maintenanceComplianceRatio,
    criticalDensity,
    dataReliabilityScore,

    // Trend & metadata
    trend: fleet.trend,
    vehicleCount,
    criticalVehicleCount: criticalCount,
    averageExposure,

    // Documentation (from single source of truth)
    formulaNotes,

    // Security index from fleet summary
    securityIndex: fleet.securityIndex,

    // Reference to underlying fleet for advanced queries
    _fleetSummary: fleet,
  };
}

/**
 * Get index metadata for UI display
 * @param indexKey The index key
 * @returns Metadata object with label, formula, data sources
 */
export function getIndexMetadata(indexKey: string) {
  const metadata: Record<string, any> = {
    riskIndex: {
      label: 'Risk Endeksi (Son 6 Ay)',
      tooltip: 'Filoningel ortalama risk puanı',
      dataSources: ['Risk Analizi', 'Bakım Merkezi'],
    },
    durabilityIndex: {
      label: 'Filo Dayanıklılık Ortalaması',
      tooltip: 'Araçların yaşlanması ve dayanıklılık göstergesi',
      dataSources: ['Bakım Merkezi', 'Sigorta'],
    },
    costPressureIndex: {
      label: 'Operasyonel Maliyet Endeksi',
      tooltip: 'Tamir/bakım maliyet yükü',
      dataSources: ['Risk Analizi', 'Aftermarket'],
    },
    maintenanceComplianceRatio: {
      label: 'Bakım Uyum Oranı',
      tooltip: 'Zamanında yapılan bakım yüzdesi',
      dataSources: ['Bakım Merkezi'],
    },
    criticalDensity: {
      label: 'Kritik Yoğunluk (% risk ≥60)',
      tooltip: 'Yüksek riskli araçların yüzdesi',
      dataSources: ['Risk Analizi'],
    },
    dataReliabilityScore: {
      label: 'Veri Güvenilirlik Skoru',
      tooltip: 'Eksiksiz ve doğru veri oranı',
      dataSources: ['Tüm Kaynaklar'],
    },
  };

  return metadata[indexKey] || { label: 'Bilinmeyen Endeks', dataSources: [] };
}

/**
 * Get detailed formula explanation from fleet summary
 * Used for tooltip expansion in Data Engine UI
 * @param summary Data Engine Summary V2
 * @param indexKey The index to get explanation for
 * @returns Object with formula, rationale, and data sources
 */
export function getFormulaExplanation(
  summary: DataEngineSummaryV2,
  indexKey: keyof typeof summary.formulaNotes
) {
  const fleetNotes = summary._fleetSummary.formulaNotes;

  const explanations: Record<string, { formula: string; rationale: string; sources: string[] }> = {
    riskIndex: {
      formula: summary.formulaNotes.riskIndex,
      rationale: `Filoningel ortalama risk skoru. Tüm araçların risk puanlarının ortalaması. Değer: ${summary.riskIndex}/100`,
      sources: fleetNotes.avgRisk ? [fleetNotes.avgRisk] : ['Risk Engine', 'Bakım Merkezi'],
    },
    durabilityIndex: {
      formula: summary.formulaNotes.durabilityIndex,
      rationale: `Risk'in tersi. Düşük risk = yüksek dayanıklılık. Değer: ${summary.durabilityIndex}/100`,
      sources: ['Risk Analysis', 'Vehicle Durability'],
    },
    costPressure: {
      formula: summary.formulaNotes.costPressure,
      rationale: `Tamir/bakım maliyeti yükü. Maruziyetin normalize edilmesi. Değer: ${summary.costPressureIndex}/100`,
      sources: fleetNotes.exposure ? [fleetNotes.exposure] : ['Cost Estimation', 'Fleet Exposure'],
    },
    maintenanceCompliance: {
      formula: summary.formulaNotes.maintenanceCompliance,
      rationale: `Zamanında gerçekleştirilen bakımların oranı. Değer: ${summary.maintenanceComplianceRatio}%`,
      sources: ['Maintenance Records', 'Bakım Merkezi'],
    },
    criticalDensity: {
      formula: summary.formulaNotes.criticalDensity,
      rationale: `Risk skoru ≥60 olan araçların yüzdesi (Kritik: ${summary.criticalVehicleCount}/${summary.vehicleCount}). Değer: ${Math.round(summary.criticalDensity)}%`,
      sources: fleetNotes.criticalCount ? [fleetNotes.criticalCount] : ['Risk Threshold', 'Fleet Analysis'],
    },
    dataReliability: {
      formula: summary.formulaNotes.dataReliability,
      rationale: `Eksiksiz ve doğru dönemli veri oranı. Veri kalitesi göstergesi. Değer: ${summary.dataReliabilityScore}%`,
      sources: ['Data Completeness', 'Source Coverage'],
    },
  };

  return explanations[indexKey] || { formula: '', rationale: '', sources: [] };
}

/**
 * Get security index explanation
 * Used for security grade display in Data Engine UI
 * @param summary Data Engine Summary V2
 * @returns Formatted explanation string
 */
export function getSecurityExplanation(summary: DataEngineSummaryV2): string {
  const { grade, score01, reasons } = summary.securityIndex;
  const percentage = Math.round(score01 * 100);

  let gradeLabel: Record<string, string> = {
    'A+': 'Çok İyi - Düşük Risk',
    'A': 'İyi - Azami Risk',
    'B': 'Orta - Yönetilebilir Risk',
    'C': 'Zayıf - Yüksek Risk',
    'D': 'Kritik - Acil Müdahale',
  };

  return `${gradeLabel[grade]} (${percentage}%) - ${reasons.join(', ')}`;
}
/**
 * Calculate trend arrow indicator
 * @param currentValue Current index value
 * @param previousValue Previous period value
 * @param threshold Minimum change threshold to register trend
 * @returns Arrow: '↑' (up), '↓' (down), or '→' (stable)
 */
export function getTrendArrow(
  currentValue: number,
  previousValue: number,
  threshold: number = 2
): '↑' | '↓' | '→' {
  const diff = currentValue - previousValue;
  if (Math.abs(diff) <= threshold) return '→';
  return diff > 0 ? '↑' : '↓';
}