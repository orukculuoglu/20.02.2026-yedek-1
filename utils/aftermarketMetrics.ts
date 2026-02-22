/**
 * Backward compatibility re-export wrapper
 * The actual implementation has moved to src/engine/aftermarket/aftermarketMetrics.ts
 * which uses Data Engine's scoreEngine.ts for unified scoring.
 */

export {
  getRegionMultiplier,
  getSupplyDifficulty,
  isSimulationMatching,
  createAftermarketMetrics,
  getRiskLabel,
  getRiskColor,
  type AftermarketMetricsContext,
  type AftermarketMetricsOutput,
} from '../src/engine/aftermarket/aftermarketMetrics';
