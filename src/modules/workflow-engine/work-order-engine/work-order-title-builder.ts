import { WorkOrderType } from '../domain';

/**
 * Build a deterministic work order title.
 *
 * @param explicitTitle - Optional explicit title provided by caller
 * @param orderType - WorkOrderType for fallback title generation
 * @param vehicleId - Vehicle ID for fallback title generation
 * @returns Final work order title
 *
 * Logic:
 * 1. If explicitTitle is provided, use it (caller intent takes precedence)
 * 2. If not provided, generate deterministic fallback from orderType + vehicleId
 * 3. Generated title format: "{orderType}: {vehicleId}"
 * 4. Deterministic: same inputs always produce same output
 * 5. No timestamps, no random suffixes
 */
export function buildWorkOrderTitle(
  explicitTitle: string | undefined,
  orderType: WorkOrderType,
  vehicleId: string,
): string {
  // 1. Use explicit title if provided
  if (explicitTitle !== undefined && explicitTitle.length > 0) {
    return explicitTitle;
  }

  // 2. Generate deterministic fallback from orderType + vehicleId
  return `${orderType}: ${vehicleId}`;
}
