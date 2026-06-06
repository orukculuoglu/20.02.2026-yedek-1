/**
 * Fleet Normalization Insight Models
 *
 * Pure aggregate operational insight extraction from normalized fleet data.
 *
 * Exports:
 * - FleetNormalizationInsightLevel: Health dimension severity scale
 * - FleetNormalizationInsightCode: Specific operational findings
 * - FleetNormalizationInsightItem: Finding with severity and count
 * - FleetNormalizationInsightModel: Complete multi-dimensional insight
 * - createFleetNormalizationInsightModel: Deterministic insight transformer
 */

export {
  FleetNormalizationInsightLevel,
  FleetNormalizationInsightCode,
} from './fleet-normalization-insight-model.result';

export type {
  FleetNormalizationInsightItem,
  FleetNormalizationInsightModel,
} from './fleet-normalization-insight-model.result';

export { createFleetNormalizationInsightModel } from './fleet-normalization-insight-model';
