/**
 * Insurance Domain Integration with Data Engine
 * Bridges Insurance Engine with Data Engine event emission
 * 
 * Responsible for:
 * - Building insurance aggregate from policy/claim data
 * - Creating insurance domain indices
 * - Emitting RISK_INDEX_SNAPSHOT events via Phase 6 sender
 */

import { buildInsuranceAggregate, getInsuranceFraudRiskLevel } from "./insuranceEngine";
import { buildInsuranceDomainIndices } from "./insuranceIndices";
import type { InsuranceDomainAggregate, InsuranceEventPayload } from "./types";
import type {
  DataEngineEventEnvelope,
  DataEngineSendResult,
} from "../data-engine/contracts/dataEngineContract";

/**
 * Emit insurance domain event to Data Engine
 * Sends RISK_INDEX_SNAPSHOT with insurance scores
 */
export async function emitInsuranceRiskSnapshot(
  vehicleId: string,
  aggregate: InsuranceDomainAggregate
): Promise<DataEngineSendResult> {
  try {
    // Dynamically import sender to avoid circular deps
    const { getDataEngineSender } = await import(
      "../data-engine/adapters/dataEngineSender"
    );

    const sender = getDataEngineSender();

    // Build payload
    const payload: InsuranceEventPayload = {
      fraudRiskScore: aggregate.fraudRiskScore,
      coverageContinuityScore: aggregate.coverageContinuityScore,
      claimFrequencyScore: aggregate.claimFrequencyScore,
      policyCount: aggregate.policies.length,
      claimCount: aggregate.claims.length,
    };

    // Build event envelope
    const envelope: DataEngineEventEnvelope<InsuranceEventPayload> = {
      schemaVersion: "DE-1.0",
      eventId: `EVT-${vehicleId}-${Date.now()}`,
      eventType: "RISK_INDEX_SNAPSHOT",
      occurredAt: new Date().toISOString(),
      tenantId: "default",
      subject: { vehicleId },
      payload,
      idempotencyKey: `INS-${vehicleId}-${aggregate.generatedAt}`,
      meta: {
        source: "INSURANCE_DOMAIN",
      },
    };

    if (import.meta.env.DEV) {
      console.debug("[Insurance Integration] Emitting risk snapshot", {
        vehicleId,
        fraudRiskScore: aggregate.fraudRiskScore,
        coverageContinuityScore: aggregate.coverageContinuityScore,
        claimFrequencyScore: aggregate.claimFrequencyScore,
      });
    }

    // Send via Phase 6 infrastructure
    return await sender.send(envelope);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (import.meta.env.DEV) {
      console.warn("[Insurance Integration] Failed to emit event", {
        error: errorMsg,
      });
    }

    return {
      status: "QUEUED",
      eventId: `EVT-${vehicleId}-${Date.now()}`,
      error: {
        code: "INSURANCE_EMISSION_ERROR",
        message: errorMsg,
      },
    };
  }
}

/**
 * Get insurance aggregate including indices
 * Returns comprehensive insurance assessment
 */
export function getInsuranceAssessment(aggregate: InsuranceDomainAggregate) {
  const indices = buildInsuranceDomainIndices(aggregate);

  return {
    aggregate,
    indices,
    riskLevel: getInsuranceFraudRiskLevel(aggregate.fraudRiskScore),
  };
}
