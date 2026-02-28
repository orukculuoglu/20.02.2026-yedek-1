/**
 * Risk Client - Sends inspection data to Risk Engine
 * Currently: Mock implementation
 * Future: Connect to real Risk Engine API
 */

import type { RiskEnginePayload } from './riskPayload';

export interface RiskEngineResponse {
  riskScore: number; // 0-100
  reasonFlags: string[];
  computedAt: string; // ISO timestamp
}

/**
 * Mock Risk Engine scoring logic
 * Formula:
 * - Base: (100 - expertScore) ... inverse of expert score
 * - Risk multipliers:
 *   - StructuralRisk: +30 points
 *   - AirbagRisk: +20 points
 *   - MechanicalRisk: +15 points
 * - Minor issues: +5 per item
 * - Major issues: +15 per item
 */
function computeMockRiskScore(payload: RiskEnginePayload): number {
  let score = 100 - payload.expertScore;

  // Risk flags
  if (payload.riskFlags.includes('StructuralRisk')) score += 30;
  if (payload.riskFlags.includes('AirbagRisk')) score += 20;
  if (payload.riskFlags.includes('MechanicalRisk')) score += 15;

  // Checklist issues
  score += payload.checklistSummary.minorItems * 5;
  score += payload.checklistSummary.majorItems * 15;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Send report data to Risk Engine
 * Mock: Simulates network delay and response
 * Production: Would call actual Risk Engine API
 */
export async function sendToRiskEngine(payload: RiskEnginePayload): Promise<RiskEngineResponse> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  // Simulate occasional failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('[RiskEngine] Mock failure: Simulated network error');
  }

  const riskScore = computeMockRiskScore(payload);

  return {
    riskScore,
    reasonFlags: payload.riskFlags,
    computedAt: new Date().toISOString(),
  };
}
