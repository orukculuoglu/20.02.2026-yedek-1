/**
 * Cross-Domain Event Sender
 * Emits CROSS_DOMAIN_FUSION_SNAPSHOT events to Data Engine
 */

import type { CrossDomainFusionResult } from "./types";
import type {
  DataEngineEventEnvelope,
  DataEngineSendResult,
} from "../data-engine/contracts/dataEngineContract";

/**
 * Emit cross-domain fusion snapshot to Data Engine
 */
export async function emitCrossDomainFusionSnapshot(
  fusionResult: CrossDomainFusionResult
): Promise<DataEngineSendResult> {
  try {
    // Dynamically import sender to avoid circular deps
    const { getDataEngineSender } = await import(
      "../data-engine/adapters/dataEngineSender"
    );

    const sender = getDataEngineSender();

    // Build event envelope
    const envelope: DataEngineEventEnvelope = {
      schemaVersion: "DE-1.0",
      eventId: `EVT-${fusionResult.vehicleId}-${Date.now()}`,
      eventType: "RISK_INDEX_SNAPSHOT",
      occurredAt: fusionResult.generatedAt,
      tenantId: "default",
      subject: { vehicleId: fusionResult.vehicleId }, // PII-safe: vehicleId only
      payload: {
        crossDomainFusion: {
          fusionScore: fusionResult.fusionScore,
          confidence: fusionResult.confidence,
          findings: fusionResult.findings.map((f) => ({
            code: f.code,
            severity: f.severity,
            message: f.message,
          })),
        },
      },
      idempotencyKey: `XD-${fusionResult.vehicleId}-${fusionResult.generatedAt}`,
      meta: {
        source: "CROSS_DOMAIN",
      },
    };

    if (import.meta.env.DEV) {
      console.debug("[Cross-Domain Event Sender] Emitting fusion snapshot", {
        vehicleId: fusionResult.vehicleId,
        fusionScore: fusionResult.fusionScore,
        confidence: fusionResult.confidence,
        findingCount: fusionResult.findings.length,
      });
    }

    // Send via Phase 6 infrastructure
    return await sender.send(envelope);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (import.meta.env.DEV) {
      console.warn("[Cross-Domain Event Sender] Failed to emit event", {
        error: errorMsg,
        vehicleId: fusionResult.vehicleId,
      });
    }

    return {
      status: "FAILED",
      eventId: `EVT-${fusionResult.vehicleId}-${Date.now()}`,
      error: {
        code: "EMISSION_FAILED",
        message: errorMsg,
      },
    };
  }
}
