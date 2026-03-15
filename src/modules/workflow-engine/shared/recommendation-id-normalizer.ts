/**
 * Deterministic recommendation ID normalization utility.
 *
 * Normalizes an array of recommendation IDs by:
 * - Removing duplicates while preserving order
 * - Retaining first occurrence of each ID
 * - Ensuring stable, reproducible output
 *
 * @param recommendationIds - Array of recommendation IDs (may contain duplicates)
 * @returns Normalized, deduplicated array preserving original order
 *
 * Guarantees:
 * - Deterministic: same input array → same output array
 * - No external dependencies, no side effects
 * - No input mutation
 * - Preserves insertion order of first occurrence
 */
export function normalizeRecommendationIds(recommendationIds: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const id of recommendationIds) {
    if (!seen.has(id)) {
      seen.add(id);
      normalized.push(id);
    }
  }

  return normalized;
}
