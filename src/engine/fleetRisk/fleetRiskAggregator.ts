import type { VehicleProfile } from '../../../types';
import { applyVehicleRiskEngine } from './vehicleRiskEngine';

export interface TrendDataPoint {
  month: string;
  risk: number;
  exposure: number;
}

export interface CategoryRadarData {
  subject: string;
  A: number;
  fullMark: number;
}

export interface RiskDistribution {
  low: number;
  mid: number;
  high: number;
}

export interface VehicleContribution {
  vehicle_id: string;
  brand: string;
  model: string;
  year: number;
  risk_score: number;
  resale_value_prediction: number;
  contribution: number;
}

export interface SecurityIndexResult {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  score01: number; // 0..1
  reasons: string[];
}

export interface FormulaNotes {
  avgRisk: string;
  criticalCount: string;
  exposure: string;
  securityIndex: string;
}

export interface FleetRiskSummary {
  avgRisk: number;
  criticalCount: number;
  highCount: number;
  exposure: number;
  exposureVehicles: VehicleContribution[];
  riskDistribution: RiskDistribution;
  categoryRadar: CategoryRadarData[];
  topRiskVehicles: VehicleProfile[];
  trend: TrendDataPoint[];
  securityIndex: SecurityIndexResult;
  formulaNotes: FormulaNotes;
}

/** Deterministic seed hash for trend generation */
function seedFromVehicles(vehicles: VehicleProfile[]): number {
  return vehicles
    .map((v) => {
      let hash = 0;
      const str = v.vehicle_id || '';
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash) % 1000;
    })
    .reduce((a, b) => a + b, 0) % 1000;
}

export function buildFleetRiskSummary(
  rawVehicles: VehicleProfile[]
): FleetRiskSummary {
  // Apply risk engine to all vehicles
  const vehicles = rawVehicles.map((v) => applyVehicleRiskEngine(v));

  if (vehicles.length === 0) {
    return {
      avgRisk: 0,
      criticalCount: 0,
      highCount: 0,
      exposure: 0,
      exposureVehicles: [],
      riskDistribution: { low: 0, mid: 0, high: 0 },
      categoryRadar: [
        { subject: 'Motor/Turbo', A: 0, fullMark: 100 },
        { subject: 'Şanzıman', A: 0, fullMark: 100 },
        { subject: 'Elektronik', A: 0, fullMark: 100 },
        { subject: 'Hasar/Şasi', A: 0, fullMark: 100 },
      ],
      topRiskVehicles: [],
      trend: [],
      securityIndex: { grade: 'A+', score01: 1.0, reasons: ['Araç verisi yüklenmedi.'] },
      formulaNotes: {
        avgRisk: '',
        criticalCount: '',
        exposure: '',
        securityIndex: '',
      },
    };
  }

  // ---- a) Apply risk engine (done above) ----

  // ---- b) Average Risk Score ----
  const avgRisk = Math.round(
    vehicles.reduce((sum, v) => sum + (v.risk_score ?? 0), 0) / vehicles.length
  );

  // ---- c) Critical Count (>= 60) ----
  const criticalCount = vehicles.filter((v) => (v.risk_score ?? 0) >= 60).length;

  // ---- d) Financial Exposure & Contributions ----
  const exposureVehicles: VehicleContribution[] = vehicles
    .filter((v) => (v.risk_score ?? 0) > 50)
    .map((v) => ({
      vehicle_id: v.vehicle_id,
      brand: v.brand,
      model: v.model,
      year: v.year,
      risk_score: v.risk_score ?? 0,
      resale_value_prediction: v.resale_value_prediction ?? 0,
      contribution:
        (v.risk_score ?? 0) > 50 ? (v.resale_value_prediction ?? 0) * 0.15 : 0,
    }))
    .sort((a, b) => b.contribution - a.contribution);

  const exposure = Math.round(
    exposureVehicles.reduce((sum, v) => sum + v.contribution, 0)
  );

  // ---- e) Risk Distribution ----
  const low = vehicles.filter((v) => (v.risk_score ?? 0) < 35).length;
  const mid = vehicles.filter(
    (v) => (v.risk_score ?? 0) >= 35 && (v.risk_score ?? 0) < 60
  ).length;
  const high = vehicles.filter((v) => (v.risk_score ?? 0) >= 60).length;

  const riskDistribution: RiskDistribution = { low, mid, high };

  // ---- f) Category Radar (filo-wide breakdown averages) ----
  const breakdownAgg = vehicles.reduce(
    (acc, v) => {
      const b = v.risk_breakdown;
      if (b) {
        acc.powertrain += b.powertrain;
        acc.transmission += b.transmission;
        acc.electronics += b.electronics;
        acc.body += b.body;
        acc.count++;
      }
      return acc;
    },
    { powertrain: 0, transmission: 0, electronics: 0, body: 0, count: 0 }
  );

  const c = Math.max(1, breakdownAgg.count);
  const categoryRadar: CategoryRadarData[] = [
    { subject: 'Motor/Turbo', A: Math.round(breakdownAgg.powertrain / c), fullMark: 100 },
    { subject: 'Şanzıman', A: Math.round(breakdownAgg.transmission / c), fullMark: 100 },
    { subject: 'Elektronik', A: Math.round(breakdownAgg.electronics / c), fullMark: 100 },
    { subject: 'Hasar/Şasi', A: Math.round(breakdownAgg.body / c), fullMark: 100 },
  ];

  // ---- g) Top Risk Vehicles ----
  const topRiskVehicles = [...vehicles]
    .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0))
    .slice(0, 5);

  // ---- h) Trend (deterministic + seed-based) ----
  const seed = seedFromVehicles(vehicles);
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs'];
  const trend: TrendDataPoint[] = months.map((month, i) => {
    const offset = ((seed + i * 7) % 100) / 100 - 0.5; // -0.5 .. +0.5
    const riskWave = Math.round(offset * 12); // ±6
    const trendRisk = Math.max(0, Math.min(100, avgRisk + riskWave));
    const exposureVal = Math.round(exposure / 1000) + i * 8 + 120;
    return { month, risk: trendRisk, exposure: exposureVal };
  });

  // ---- i) Security Index ----
  const criticalRate = vehicles.length > 0 ? criticalCount / vehicles.length : 0;
  const exposureRatio =
    vehicles.length > 0
      ? exposure /
        (vehicles.reduce((sum, v) => sum + (v.resale_value_prediction ?? 0), 0) || 1)
      : 0;

  // Score: avg of avgRisk (0-1 norm), criticalRate, exposureRatio
  const riskFactor = avgRisk / 100;
  const score01 = Math.max(0, Math.min(1, (riskFactor + criticalRate + exposureRatio * 0.5) / 3));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  const reasons: string[] = [];

  if (score01 <= 0.2) {
    grade = 'A+';
    reasons.push('Çok düşük risk profili');
    if (criticalRate === 0) reasons.push('Kritik araç yok');
  } else if (score01 <= 0.4) {
    grade = 'A';
    reasons.push('Düşük risk profilesi');
    if (criticalRate < 0.1) reasons.push('Kritik araçlar %10 altında');
  } else if (score01 <= 0.6) {
    grade = 'B';
    reasons.push('Orta seviye risk');
    if (criticalRate < 0.3) reasons.push('Kritik araçlar %30 altında');
  } else if (score01 <= 0.8) {
    grade = 'C';
    reasons.push('Yüksek risk profili');
    if (criticalRate >= 0.3) reasons.push(`Kritik araçlar %${Math.round(criticalRate * 100)} oranında`);
  } else {
    grade = 'D';
    reasons.push('Kritik risk durumu');
    if (criticalRate >= 0.5) reasons.push(`Kritik araçlar %${Math.round(criticalRate * 100)} oranında`);
  }

  if (exposureRatio > 0.3) {
    reasons.push('Yüksek finansal maruziyeti');
  }

  const securityIndex: SecurityIndexResult = {
    grade,
    score01: Number(score01.toFixed(2)),
    reasons,
  };

  // ---- j) Formula Notes ----
  const formulaNotes: FormulaNotes = {
    avgRisk: `Σ(vehicle.risk_score) / ${vehicles.length} = ${avgRisk}/100`,
    criticalCount: `risk_score ≥ 60 olan araçlar: ${criticalCount}/${vehicles.length}`,
    exposure: `Σ(risk_score > 50 ? resale_value * 0.15 : 0) = ${exposure.toLocaleString('tr-TR')} ₺ (${exposureVehicles.length} araçtan)`,
    securityIndex: `Grade: ${grade} (score: ${score01.toFixed(2)}) | Faktörler: ${reasons.join(', ')}`,
  };

  return {
    avgRisk,
    criticalCount,
    highCount: high,
    exposure,
    exposureVehicles,
    riskDistribution,
    categoryRadar,
    topRiskVehicles,
    trend,
    securityIndex,
    formulaNotes,
  };
}
