/**
 * Deterministic ID Generation Utility
 *
 * Shared utility for both Phase 5 (Graph Attachment) and Phase 6 (Index Preparation).
 * Uses SHA-256 hashing for stable, collision-resistant IDs.
 * Meant for server/backend processing, not browser execution.
 */

import { createHash } from 'crypto';

/**
 * Generate deterministic ID from input string.
 * Uses SHA-256 hash for stable, collision-resistant IDs.
 * No randomness, reproducible.
 *
 * @param input - String to hash
 * @returns 16-character deterministic hex ID
 */
export function generateDeterministicId(input: string): string {
  return createHash('sha256').update(input).digest('hex').substring(0, 16);
}
