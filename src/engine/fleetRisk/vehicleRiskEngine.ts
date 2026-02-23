import type { VehicleProfile } from '../../../types';

export type RiskAction = 'KEEP' | 'SERVICE' | 'INSPECT' | 'SELL';

export interface VehicleRiskBreakdown {
  powertrain: number;   // motor/turbo
  transmission: number; // şanzıman
  electronics: number;  // elektronik
  body: number;         // şasi/kaporta + tramer etkisi
}

export interface VehicleRiskResult {
  risk_score: number; // 0..100 (yüksek = daha riskli)
  average_part_life_score: number; // 0..100 (yüksek = daha sağlıklı)
  risk_breakdown: VehicleRiskBreakdown;
  risk_primary_reason: string;
  risk_confidence: number; // 0..1
  risk_action: RiskAction;
}

/** 0..1 normalize */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 0..100 clamp */
const clamp100 = (x: number) => Math.max(0, Math.min(100, x));

export function computeVehicleRisk(v: VehicleProfile): VehicleRiskResult {
  const mileage = Number.isFinite(v.mileage as any) ? Number(v.mileage) : 0;
  const dmgProb = Number.isFinite(v.damage_probability as any) ? Number(v.damage_probability) : 0; // 0..100
  const ffi = Number.isFinite(v.failure_frequency_index as any) ? Number(v.failure_frequency_index) : 0; // 0.. ~3
  const partLife = Number.isFinite(v.average_part_life_score as any) ? Number(v.average_part_life_score) : 70; // 0..100
  const queries = Number.isFinite(v.total_queries as any) ? Number(v.total_queries) : 0;

  // ---- signals (0..1) ----
  const healthRisk = clamp01((100 - partLife) / 100);

  // 0 km -> 0, 200k km -> ~1
  const mileageRisk = clamp01(Math.log10(1 + mileage) / Math.log10(1 + 200000));

  const damageRisk = clamp01(dmgProb / 100);
  const freqRisk = clamp01(ffi / 2.5);
  const queryRisk = clamp01(queries / 50);

  // ---- breakdown (0..100) ----
  // NOT: Burada *100 YOK. Çünkü ağırlıklı toplam zaten 0..100.
  const powertrain = clamp100(healthRisk * 45 + mileageRisk * 30 + freqRisk * 25);
  const transmission = clamp100(freqRisk * 45 + mileageRisk * 40 + healthRisk * 15);
  const electronics = clamp100(queryRisk * 40 + healthRisk * 35 + freqRisk * 25);
  const body = clamp100(damageRisk * 70 + mileageRisk * 15 + healthRisk * 15);

  // ---- overall risk score ----
  // bileşenler 0..100 olduğundan, ağırlıklı ortalamayı /100 ile normalize ediyoruz
  const riskScore01 =
    (powertrain * 0.30 +
      transmission * 0.25 +
      electronics * 0.20 +
      body * 0.25) / 100;

  const risk_score = clamp100(Math.round(riskScore01 * 100));

  // ---- confidence ----
  const confidence = clamp01(
    0.35 +
      queryRisk * 0.25 +
      mileageRisk * 0.20 +
      damageRisk * 0.20
  );

  // ---- primary reason ----
  const top = [
    { key: 'Motor/Turbo', val: powertrain },
    { key: 'Şanzıman', val: transmission },
    { key: 'Elektronik', val: electronics },
    { key: 'Hasar/Şasi', val: body },
  ].sort((a, b) => b.val - a.val)[0];

  const risk_primary_reason =
    risk_score >= 75
      ? `Kritik risk: ${top.key} baskın (${Math.round(top.val)}/100)`
      : risk_score >= 55
        ? `Yüksek risk: ${top.key} etkisi yüksek (${Math.round(top.val)}/100)`
        : risk_score >= 35
          ? `Orta risk: ${top.key} sinyali (${Math.round(top.val)}/100)`
          : `Düşük risk: stabil kullanım (${Math.round(top.val)}/100)`;

  // ---- action ----
  let risk_action: RiskAction = 'KEEP';
  if (risk_score >= 80) risk_action = 'SELL';
  else if (risk_score >= 65) risk_action = 'INSPECT';
  else if (risk_score >= 45) risk_action = 'SERVICE';

  return {
    risk_score,
    average_part_life_score: clamp100(Math.round(partLife)),
    risk_breakdown: {
      powertrain: Math.round(powertrain),
      transmission: Math.round(transmission),
      electronics: Math.round(electronics),
      body: Math.round(body),
    },
    risk_primary_reason,
    risk_confidence: Number(confidence.toFixed(2)),
    risk_action,
  };
}

/** VehicleProfile üzerine merge eden helper */
export function applyVehicleRiskEngine(v: VehicleProfile): VehicleProfile {
  const r = computeVehicleRisk(v);
  return {
    ...v,
    risk_score: r.risk_score,
    average_part_life_score: r.average_part_life_score,
    risk_breakdown: r.risk_breakdown,
    risk_primary_reason: r.risk_primary_reason,
    risk_confidence: r.risk_confidence,
    risk_action: r.risk_action,
  };
}
