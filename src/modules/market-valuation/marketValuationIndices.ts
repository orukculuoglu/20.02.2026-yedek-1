/**
 * Market Valuation Indices Builder
 * Converts market valuation aggregate into DataEngineIndex format
 * 
 * Note: DataEngineIndex.value is 0-100 scale
 * TRY values are stored in meta as raw data, with normalized index
 */

import type { DataEngineIndex } from "../data-engine/indicesDomainEngine";
import type { MarketValuationAggregate } from "./types";
import { normalizeTRYToIndex } from "./marketValuationEngine";

/**
 * Build market valuation indices
 * 
 * Returns one primary index with normalized value (0-100)
 * Raw TRY values and depreciation stored in metadata
 */
export function buildMarketValuationIndices(
  aggregate: MarketValuationAggregate
): DataEngineIndex[] {
  const indices: DataEngineIndex[] = [];
  const now = new Date().toISOString();

  // Normalize TRY value to 0-100 scale
  const normalizedIndex = normalizeTRYToIndex(aggregate.resaleValue);

  // Primary index: Market value index
  indices.push({
    domain: "risk",
    key: "marketValueIndex",
    value: normalizedIndex,
    confidence: aggregate.confidence,
    updatedAt: now,
    meta: {
      description: "Market resale value index (0=600k TRY, 100=2.5M TRY)",
      source: aggregate.source,
      // Raw TRY values
      priceBandTRY: {
        low: aggregate.priceBand.low,
        median: aggregate.priceBand.median,
        high: aggregate.priceBand.high,
        currency: "TRY",
      },
      resaleValueTRY: aggregate.resaleValue,
      // Depreciation history
      depreciation12m: aggregate.depreciation12m,
      // Reasoning
      reasonCodes: aggregate.explain?.reasonCodes,
    },
  });

  if (import.meta.env.DEV) {
    console.debug("[Market Valuation Indices] Built indices", {
      count: indices.length,
      vehicleId: aggregate.vehicleId,
      normalizedIndex,
      resaleValueTRY: aggregate.resaleValue,
    });
  }

  return indices;
}
