export type ClampMode = "round" | "floor" | "ceil";

export function clamp(value: number, min = 0, max = 100): number {
  const v = Number.isFinite(value) ? value : min;
  const lo = Number.isFinite(min) ? min : 0;
  const hi = Number.isFinite(max) ? max : 100;
  return Math.min(hi, Math.max(lo, v));
}

export function norm01(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return 0;
  const range = max - min;
  if (range <= 0) return 0;
  return clamp((value - min) / range, 0, 1);
}

export function toScore01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return clamp(value, 0, 1);
}

export type ScoreInputs = {
  // Aftermarket / stok-tahmin
  effectiveDailyDemand: number;      // adet/gün
  daysLeftBeforeStockout: number;    // gün
  minStock: number;                 // adet
  usableStock: number;              // adet
  supplyRisk: number;               // 0..1 (yoksa kendimiz türetiriz)
  demandPressure: number;           // 0..1
  stockRisk: number;                // 0..1

  // Simülasyon / veri motoru önerisi
  simulationActive?: boolean;
  simulationConfidence?: number;    // 0..1
  simulationImpact?: number;        // 0..100

  // Finansal / marka
  marginPercent?: number;           // 0..100
  turnoverScore?: number;           // 0..100
  brandTier?: "OEM" | "PREMIUM" | "EQUIVALENT" | "UNKNOWN";

  // Veri kalitesi / kapsama (yoksa mock)
  dataCompleteness?: number;        // 0..1
  sourceCoverage?: number;          // 0..1
  consistencyScore?: number;        // 0..1

  // Opsiyonel: araç özel sinyaller (bakım/hasar vs)
  mileageKm?: number;
  incidentRate?: number;            // 0..1
};

export type DataEngineScores = {
  generalRisk: number;      // 0..100
  durability: number;       // 0..100
  costPressure: number;     // 0..100
  supplyStress: number;     // 0..100
  brandImpact: number;      // 0..100
  trustScore: number;       // 0..100

  // debug/izleme
  components: {
    demandPressureScore: number;
    stockoutUrgencyScore: number;
    supplyRiskScore: number;
    marginScore: number;
    dataQualityScore: number;
    simulationBoost: number;
  };
};

function brandBaseImpact(tier: ScoreInputs["brandTier"]): number {
  switch (tier) {
    case "OEM": return 55;
    case "PREMIUM": return 65;
    case "EQUIVALENT": return 45;
    default: return 50;
  }
}

/**
 * V1 mantık:
 * - risk: demandPressure + stockRisk + supplyRisk (ağırlıklı)
 * - dayanıklılık: (düşük risk) + (incidentRate düşük) + (mileage etkisi)
 * - maliyet baskısı: düşük marj + yüksek demand + (OEM/PREMIUM ağırlığı)
 * - tedarik stresi: supplyRisk + stockoutUrgency
 * - marka etkisi: marj + tier + (simülasyon etkisi varsa)
 * - güven: veri kalitesi + kapsama + tutarlılık + (simülasyon confidence)
 */
export function createDataEngineScores(input: ScoreInputs): DataEngineScores {
  const days = input.daysLeftBeforeStockout ?? 999;

  // 0..1 ara skorlar
  const stockoutUrgency01 = 1 - clamp(days, 0, 60) / 60;        // 0: 60+ gün, 1: bugün bitiyor
  const demandPressure01 = clamp(input.demandPressure ?? 0, 0, 1);
  const supplyRisk01 = clamp(input.supplyRisk ?? 0, 0, 1);
  const stockRisk01 = clamp(input.stockRisk ?? 0, 0, 1);

  const marginPct = input.marginPercent ?? 25;
  const margin01 = clamp(marginPct, 0, 60) / 60;                // 0..1 (60% üstünü tavan)
  const lowMarginPressure01 = 1 - margin01;

  const baseTier = brandBaseImpact(input.brandTier);

  const dataCompleteness01 = clamp(input.dataCompleteness ?? 0.75, 0, 1);
  const sourceCoverage01 = clamp(input.sourceCoverage ?? 0.70, 0, 1);
  const consistency01 = clamp(input.consistencyScore ?? 0.80, 0, 1);
  const dataQuality01 = (dataCompleteness01 * 0.45) + (sourceCoverage01 * 0.30) + (consistency01 * 0.25);

  const simConf01 = clamp(input.simulationConfidence ?? (input.simulationActive ? 0.85 : 0), 0, 1);
  const simBoost = input.simulationActive ? clamp((input.simulationImpact ?? 0) * 0.10, 0, 8) : 0; // max +8

  // Skorlar
  const generalRisk = clamp(
    (toScore01(demandPressure01) * 0.35) +
    (toScore01(stockRisk01) * 0.35) +
    (toScore01(supplyRisk01) * 0.30) +
    (stockoutUrgency01 * 12) + // aciliyet bonus
    simBoost
  );

  const supplyStress = clamp(
    (toScore01(supplyRisk01) * 0.55) +
    (toScore01(stockoutUrgency01) * 0.35) +
    (toScore01(stockRisk01) * 0.10)
  );

  const costPressure = clamp(
    (toScore01(lowMarginPressure01) * 0.50) +
    (toScore01(demandPressure01) * 0.25) +
    (baseTier * 0.25)
  );

  const brandImpact = clamp(
    (baseTier * 0.50) +
    (toScore01(margin01) * 0.35) +
    (input.simulationActive ? 8 : 0)
  );

  // dayanıklılık = 100 - risk + incident/mileage düzeltmesi
  const incident01 = clamp(input.incidentRate ?? 0.15, 0, 1);
  const mileage = input.mileageKm ?? 120000;
  const mileagePenalty = clamp(norm01(mileage, 60000, 220000) * 20, 0, 20); // 0..20
  const durability = clamp(
    100 - generalRisk - (incident01 * 18) - mileagePenalty
  );

  const trustScore = clamp(
    (toScore01(dataQuality01) * 0.80) +
    (toScore01(simConf01) * 0.20)
  );

  // Sanitize: Ensure all scores are finite numbers in valid ranges
  const safe = (n: number) => (Number.isFinite(n) ? clamp(n, 0, 100) : 0);
  const safe01 = (n: number) => (Number.isFinite(n) ? clamp(n, 0, 1) : 0);

  return {
    generalRisk: safe(generalRisk),
    durability: safe(durability),
    costPressure: safe(costPressure),
    supplyStress: safe(supplyStress),
    brandImpact: safe(brandImpact),
    trustScore: safe(trustScore),
    components: {
      demandPressureScore: safe01(toScore01(demandPressure01)),
      stockoutUrgencyScore: safe01(toScore01(stockoutUrgency01)),
      supplyRiskScore: safe01(toScore01(supplyRisk01)),
      marginScore: safe01(toScore01(margin01)),
      dataQualityScore: safe01(toScore01(dataQuality01)),
      simulationBoost: safe(simBoost),
    },
  };
}
