/**
 * Explanation helpers for weighting results
 * Generate human-readable descriptions of weight calculations
 */

import type { CompositeWeightResult } from './composite-weighting.types';

/**
 * Generate a human-readable explanation of how a composite score was calculated
 *
 * @param result - The weight calculation result
 * @returns Explanation string
 */
export function generateWeightExplanation(result: CompositeWeightResult): string {
  if (result.contributions.length === 0) {
    return `No inputs available for ${result.compositeType}`;
  }

  const parts: string[] = [];

  for (const contribution of result.contributions) {
    const scoreStr = contribution.inputScore.toFixed(2);
    const weightStr = (contribution.weightApplied * 100).toFixed(1);
    const contributionStr = contribution.weightedScore.toFixed(4);

    parts.push(
      `${contribution.slotKey} (${scoreStr} × ${weightStr}% = ${contributionStr})`,
    );
  }

  const finalScore = result.normalizedScore.toFixed(4);
  return `${result.compositeType} score = ${parts.join(' + ')} = ${finalScore}`;
}
