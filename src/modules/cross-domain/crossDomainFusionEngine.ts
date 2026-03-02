/**
 * Cross-Domain Fusion Engine
 * Detects anomalies and convergence between Insurance and Risk domains
 * 
 * Scoring: fusionScore (0-100) based on cross-domain rule matches
 */

import type {
  CrossDomainContext,
  CrossDomainFinding,
  CrossDomainFusionResult,
} from "./types";

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if reasonCodes array contains a specific code
 */
function hasReasonCode(
  codes: Array<{ code: string }> | undefined,
  targetCode: string
): boolean {
  return codes ? codes.some((c) => c.code === targetCode) : false;
}

/**
 * Rule A: CLAIMS_WITHOUT_DAMAGE_RISK
 * If insurance has claims but structural risk is low/zero
 */
function checkClaimsWithoutDamage(
  ctx: CrossDomainContext,
  findings: CrossDomainFinding[]
): number {
  let score = 0;

  const hasMultipleClaims = (ctx.insurance?.claimCount12m ?? 0) >= 2;
  const lowDamageRisk = (ctx.risk?.structuralRisk ?? 0) === 0;

  if (hasMultipleClaims && lowDamageRisk) {
    score += 20;
    findings.push({
      code: "CLAIMS_WITHOUT_DAMAGE_RISK",
      severity: "warn",
      message: `${ctx.insurance?.claimCount12m} claims in 12m but zero structural risk context`,
      meta: {
        claimCount: ctx.insurance?.claimCount12m,
        structuralRisk: ctx.risk?.structuralRisk,
      },
    });

    if (import.meta.env.DEV) {
      console.debug("[Cross-Domain] Rule A matched: CLAIMS_WITHOUT_DAMAGE_RISK");
    }
  }

  return score;
}

/**
 * Rule B: POLICY_EXPIRED_HIGH_TRUST_CONFLICT
 * If policy is expired/unknown but trust is high (contradiction signal)
 */
function checkPolicyStatusConflict(
  ctx: CrossDomainContext,
  findings: CrossDomainFinding[]
): number {
  let score = 0;

  const policyNotActive =
    ctx.insurance?.policyStatus &&
    ["EXPIRED", "UNKNOWN"].includes(ctx.insurance.policyStatus);
  const highTrust = (ctx.risk?.trustIndex ?? 0) >= 70;

  if (policyNotActive && highTrust) {
    score += 15;
    findings.push({
      code: "POLICY_STATUS_TRUST_CONFLICT",
      severity: "warn",
      message: `Policy ${ctx.insurance?.policyStatus} but high trust index (${ctx.risk?.trustIndex})`,
      meta: {
        policyStatus: ctx.insurance?.policyStatus,
        trustIndex: ctx.risk?.trustIndex,
      },
    });

    if (import.meta.env.DEV) {
      console.debug("[Cross-Domain] Rule B matched: POLICY_STATUS_TRUST_CONFLICT");
    }
  }

  return score;
}

/**
 * Rule C: HIGH_INSURANCE_COVERAGE_RISK + LOW_TRUST
 * If coverage risk is high AND trust is low (convergence signal)
 */
function checkRiskConvergence(
  ctx: CrossDomainContext,
  findings: CrossDomainFinding[]
): number {
  let score = 0;

  const highCoverageRisk = (ctx.insurance?.coverageRiskIndex ?? 0) >= 70;
  const lowTrust = (ctx.risk?.trustIndex ?? 0) <= 45;

  if (highCoverageRisk && lowTrust) {
    score += 30;
    findings.push({
      code: "CROSS_DOMAIN_RISK_CONVERGENCE",
      severity: "high",
      message: `High coverage risk (${ctx.insurance?.coverageRiskIndex}) + low trust (${ctx.risk?.trustIndex}) convergence`,
      meta: {
        coverageRiskIndex: ctx.insurance?.coverageRiskIndex,
        trustIndex: ctx.risk?.trustIndex,
      },
    });

    if (import.meta.env.DEV) {
      console.debug("[Cross-Domain] Rule C matched: CROSS_DOMAIN_RISK_CONVERGENCE");
    }
  }

  return score;
}

/**
 * Rule D: KM_ANOMALY + INSURANCE_DAMAGE_INCONSISTENCY
 * If both risk and insurance have anomaly-related reasonCodes
 */
function checkAnomalyConvergence(
  ctx: CrossDomainContext,
  findings: CrossDomainFinding[]
): number {
  let score = 0;

  const hasInsuranceAnomaly = hasReasonCode(
    ctx.insurance?.reasonCodes,
    "INSURANCE_DAMAGE_INCONSISTENCY"
  );
  const hasKmAnomaly =
    hasReasonCode(ctx.risk?.reasonCodes, "KM_ANOMALY") ||
    hasReasonCode(ctx.risk?.reasonCodes, "ODOMETER_ANOMALY");

  if (hasInsuranceAnomaly && hasKmAnomaly) {
    score += 25;
    findings.push({
      code: "CROSS_DOMAIN_SUSPICION_INDICES",
      severity: "high",
      message: `KM anomaly + insurance inconsistency detected (cross-domain suspicion)`,
      meta: {
        insuranceAnomaly: "INSURANCE_DAMAGE_INCONSISTENCY",
        riskAnomaly: hasReasonCode(ctx.risk?.reasonCodes, "KM_ANOMALY")
          ? "KM_ANOMALY"
          : "ODOMETER_ANOMALY",
      },
    });

    if (import.meta.env.DEV) {
      console.debug("[Cross-Domain] Rule D matched: CROSS_DOMAIN_SUSPICION_INDICES");
    }
  }

  return score;
}

/**
 * Build cross-domain findings and fusion score
 * 
 * Main entry point for cross-domain analysis
 */
export function buildCrossDomainFindings(
  ctx: CrossDomainContext
): CrossDomainFusionResult {
  const findings: CrossDomainFinding[] = [];
  let fusionScore = 0;

  // Apply all rules
  fusionScore += checkClaimsWithoutDamage(ctx, findings);
  fusionScore += checkPolicyStatusConflict(ctx, findings);
  fusionScore += checkRiskConvergence(ctx, findings);
  fusionScore += checkAnomalyConvergence(ctx, findings);

  // Clamp fusion score
  fusionScore = clamp(fusionScore, 0, 100);

  // Calculate confidence
  let confidence = Math.min(
    ctx.risk?.confidenceAvg ?? 50,
    ctx.insurance?.confidence ?? 50
  );

  // Penalize if either side is missing
  if (!ctx.risk) confidence -= 10;
  if (!ctx.insurance) confidence -= 10;

  confidence = clamp(confidence, 0, 100);

  if (import.meta.env.DEV) {
    console.debug("[Cross-Domain] Fusion analysis complete", {
      vehicleId: ctx.vehicleId,
      fusionScore,
      confidence,
      findingCount: findings.length,
    });
  }

  return {
    vehicleId: ctx.vehicleId,
    findings,
    fusionScore,
    confidence,
    generatedAt: ctx.generatedAt || new Date().toISOString(),
  };
}

/**
 * Classify fusion score severity
 * DEV utility for UI display
 */
export function getFusionSeverity(score: number): "info" | "warn" | "high" {
  if (score < 30) return "info";
  if (score < 60) return "warn";
  return "high";
}
