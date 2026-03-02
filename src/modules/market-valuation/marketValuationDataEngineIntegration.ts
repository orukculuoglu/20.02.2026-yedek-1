/**
 * Market Valuation Data Engine Integration
 * Bridges Market Valuation Engine with Data Engine event emission
 * 
 * Responsible for:
 * - Building valuation aggregate
 * - Creating valuation indices
 * - Emitting RISK_INDEX_SNAPSHOT events via Phase 6 sender
 * - Providing safe, PII-clean payloads
 */

import { buildMarketValuationAggregate } from "./marketValuationEngine";
import { buildMarketValuationIndices } from "./marketValuationIndices";
import type {
  ValuationInput,
  MarketValuationAggregate,
  MarketValuationEventPayload,
} from "./types";
import type { DataEngineEventEnvelope, DataEngineSendResult } from "../data-engine/contracts/dataEngineContract";

/**
 * Emit market valuation event to Data Engine
 * Sends RISK_INDEX_SNAPSHOT with valuation data
 */
export async function emitMarketValuationSnapshot(
  vehicleId: string,
  aggregate: MarketValuationAggregate
): Promise<DataEngineSendResult> {
  try {
    // Dynamically import sender to avoid circular deps
    const { getDataEngineSender } = await import(
      "../data-engine/adapters/dataEngineSender"
    );

    const sender = getDataEngineSender();

    // Build payload (PII-safe: vehicleId only, no VIN/plate)
    const payload: MarketValuationEventPayload = {
      resaleValueTRY: aggregate.resaleValue,
      band: {
        low: aggregate.priceBand.low,
        median: aggregate.priceBand.median,
        high: aggregate.priceBand.high,
        currency: "TRY",
      },
      confidence: aggregate.confidence,
      source: aggregate.source,
    };

    // Build event envelope
    const envelope: DataEngineEventEnvelope<MarketValuationEventPayload> = {
      schemaVersion: "DE-1.0",
      eventId: `EVT-${vehicleId}-${Date.now()}`,
      eventType: "RISK_INDEX_SNAPSHOT",
      occurredAt: new Date().toISOString(),
      tenantId: "default",
      subject: { vehicleId },
      payload,
      idempotencyKey: `MV-${vehicleId}-${aggregate.generatedAt}`,
      meta: {
        source: "MARKET_VALUATION",
      },
    };

    if (import.meta.env.DEV) {
      console.debug("[Market Valuation Integration] Emitting snapshot", {
        vehicleId,
        resaleValueTRY: aggregate.resaleValue,
        confidence: aggregate.confidence,
      });
    }

    // Send via Phase 6 infrastructure
    return await sender.send(envelope);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (import.meta.env.DEV) {
      console.warn("[Market Valuation Integration] Failed to emit event", {
        error: errorMsg,
      });
    }

    return {
      status: "QUEUED",
      eventId: `EVT-${vehicleId}-${Date.now()}`,
      error: {
        code: "VALUATION_EMISSION_ERROR",
        message: errorMsg,
      },
    };
  }
}

/**
 * Get market valuation assessment including indices
 * Returns comprehensive valuation data
 */
export function getMarketValuationAssessment(aggregate: MarketValuationAggregate) {
  const indices = buildMarketValuationIndices(aggregate);

  return {
    aggregate,
    indices,
  };
}

/**
 * Process valuation input and emit event
 * Convenience function combining build + emit + return
 */
export async function calculateAndEmitValuation(
  input: ValuationInput
): Promise<{ assessment: any; sendResult: DataEngineSendResult }> {
  // Build aggregate
  const aggregate = buildMarketValuationAggregate(input);

  // Get assessment with indices
  const assessment = getMarketValuationAssessment(aggregate);

  // Emit event
  const sendResult = await emitMarketValuationSnapshot(input.vehicleId, aggregate);

  return { assessment, sendResult };
}
