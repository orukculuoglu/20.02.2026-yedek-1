/**
 * Band resolution for composite records
 * Maps normalized score to deterministic band
 */

import { resolveCompositeBand } from '../core/composite.band';
import type { CompositeBand } from '../core/composite.band';

/**
 * Resolve band for composite record based on normalized score
 *
 * Uses the existing band resolution logic from core module.
 * Throws error if no band can be determined.
 *
 * @param normalizedScore - The normalized composite score (0.0 - 1.0)
 * @returns The resolved composite band
 * @throws Error if no band resolves from the score
 */
export function resolveCompositeBandForRecord(normalizedScore: number): CompositeBand {
  const band = resolveCompositeBand(normalizedScore);

  if (!band) {
    throw new Error(
      `Failed to resolve composite band for normalized score: ${normalizedScore}`,
    );
  }

  return band;
}
