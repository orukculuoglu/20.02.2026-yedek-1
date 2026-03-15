import { normalizeRecommendationIds } from '../shared/recommendation-id-normalizer';

/**
 * Link and normalize recommendation IDs to a workflow.
 *
 * @param recommendationIds - Array of recommendation IDs (may contain duplicates)
 * @returns Normalized, deduplicated array of recommendation IDs
 *
 * Normalization logic:
 * - Deduplicates IDs while preserving order
 * - First occurrence of each ID is retained
 * - Deterministic: same input array → same output array
 * - No external dependencies, no side effects
 */
export function linkRecommendations(recommendationIds: string[]): string[] {
  return normalizeRecommendationIds(recommendationIds);
}
