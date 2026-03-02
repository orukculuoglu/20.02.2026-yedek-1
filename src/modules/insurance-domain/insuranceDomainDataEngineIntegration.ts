/**
 * Insurance Domain Data Engine Integration
 * Emits RISK_INDEX_SNAPSHOT events for Data Engine pipeline
 */

import type { InsuranceDomainAggregate } from "./types";
import { buildInsuranceDomainIndices } from "./insuranceDomainIndices";
import type { DataEngineEventEnvelope, DataEngineSendResult } from "../data-engine/contracts/dataEngineContract";

/**
 * Emit insurance domain snapshot to Data Engine
 * 
 * Creates RISK_INDEX_SNAPSHOT event with:
 * - Subject: { vehicleId } only (strict PII minimalism)
 * - Payload: Complete insurance aggregate with metrics
 * - Source: INSURANCE_DOMAIN
 */
export async function emitInsuranceDomainSnapshot(
  vehicleId: string,
  aggregate: InsuranceDomainAggregate
): Promise<DataEngineSendResult> {
  try {
    // Dynamically import sender to avoid circular deps
    const { getDataEngineSender } = await import(
      "../data-engine/adapters/dataEngineSender"
    );

    const sender = getDataEngineSender();

    // Build event envelope (PII-safe: vehicleId subject ONLY)
    const envelope: DataEngineEventEnvelope = {
      schemaVersion: "DE-1.0",
      eventId: `EVT-${vehicleId}-${Date.now()}`,
      eventType: "RISK_INDEX_SNAPSHOT",
      occurredAt: aggregate.generatedAt,
      tenantId: "default",
      subject: { vehicleId }, // ONLY safe identifier
      payload: {
        insurance: {
          policyType: aggregate.policy.policyType,
          policyStatus: aggregate.policy.status,
          policyEndDate: aggregate.policy.endDate,
          insurerName: aggregate.policy.insurerName,
          claimCount12m: aggregate.derived.claimCount12m,
          lapseCount12m: aggregate.derived.lapseCount12m,
          inquiryCount6m: aggregate.derived.inquiryCount6m,
          lastClaimDate: aggregate.derived.lastClaimDate,
          coverageRiskIndex: aggregate.indexes.coverageRiskIndex,
          confidence: aggregate.confidence,
          reasonCodes: aggregate.explain?.reasonCodes ?? [],
        },
      },
      idempotencyKey: `INS-${vehicleId}-${aggregate.generatedAt}`,
      meta: {
        source: "INSURANCE_DOMAIN",
      },
    };

    if (import.meta.env.DEV) {
      console.debug("[Insurance Domain Integration] Emitting snapshot", {
        vehicleId,
        coverageRiskIndex: aggregate.indexes.coverageRiskIndex,
        confidence: aggregate.confidence,
      });
    }

    // Send via Phase 6 infrastructure
    return await sender.send(envelope);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (import.meta.env.DEV) {
      console.warn("[Insurance Domain Integration] Failed to emit event", {
        error: errorMsg,
        vehicleId,
      });
    }

    return {
      status: "FAILED",
      eventId: `EVT-${vehicleId}-${Date.now()}`,
      error: {
        code: "EMISSION_FAILED",
        message: errorMsg,
      },
    };
  }
}
