/**
 * Confidence Value Normalization Utilities
 * PHASE 3 STEP 2 FIX: Ensure all confidence values are normalized to 0-100 range
 *
 * Problem: Sometimes confidence values come in different scales (0-1, 0-100, 0-10000, etc)
 * Solution: Single source of truth for normalization
 */

/**
 * Normalize confidence value to 0-100 range
 * Handles various input scales:
 * - value <= 1   => multiply by 100 (0-1 scale to 0-100)
 * - value > 100  => divide by 100 if needed (0-10000 to 0-100)
 * - otherwise    => use as-is (already 0-100)
 * 
 * @param value Confidence value (can be 0-1, 0-100, 0-10000, null, undefined)
 * @returns Normalized value in 0-100 range
 */
export function normalizeConfidence(value: number | undefined | null): number {
  if (!value || isNaN(value)) return 0;
  
  // If 0-1 scale, convert to 0-100
  if (value <= 1) return value * 100;
  
  // If >100, likely 0-10000 scale, divide by 100
  if (value > 100) {
    // If absurdly high (>1000), likely already scaled wrong, cap it
    if (value > 1000) return 100;
    return value / 100;
  }
  
  // Already in 0-100 range
  return value;
}

/**
 * Format confidence as percentage string (0-100 range, 1 decimal place)
 * 
 * @param value Confidence value (any scale)
 * @returns Formatted string like "66.5%"
 */
export function formatConfidence(value: number | undefined | null): string {
  const normalized = normalizeConfidence(value);
  const bounded = Math.min(100, Math.max(0, normalized));
  return `${bounded.toFixed(1)}%`;
}

/**
 * Bound value to 0-100 range
 * 
 * @param value Any number
 * @returns Value clamped to 0-100
 */
export function boundToHundred(value: number): number {
  return Math.min(100, Math.max(0, value));
}
