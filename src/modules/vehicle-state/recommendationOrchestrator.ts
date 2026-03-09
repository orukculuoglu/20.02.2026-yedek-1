/**
 * Recommendation Orchestrator
 * Phase 9.4: Async recommendation generation and snapshot storage
 * Phase 9.7.2: Added optional callback for React reactivity bridge
 * Phase 11.2: Extended to generate vehicle actions from recommendations
 *
 * Design:
 * - Pure function wrapper: Calls pure recommendation/action engines
 * - Async-safe: Can be called from any context without blocking
 * - Snapshot mutation: Updates snapshot with generated recommendations and actions
 * - Optional callback: Notifies caller when storage completes (for UI re-render)
 * - NO event emission: Just stores in snapshot
 * - NO reducer integration: Direct snapshot write
 * - Dormant by default: No automatic wiring
 *
 * Usage:
 * - Called manually by UI components (Phase 9.5)
 * - Called from async recommendation orchestration (Phase 9.4+)
 * - Pass optional onStored callback for React re-render trigger
 * - NOT called by reducer, aggregator, or ingestion
 */

import { generateVehicleIntelligenceRecommendations, isSnapshotSufficientForRecommendations } from '../data-engine/recommendations/recommendationEngine';
import { generateVehicleActionsFromRecommendations } from '../data-engine/actions/actionEngine';
import { getSnapshot, upsertSnapshot } from './vehicleStateSnapshotStore';

/**
 * Generate vehicle intelligence recommendations and store in snapshot
 * Phase 11.2: Extended to also generate and store vehicle actions from recommendations
 * Completely harmless async operation - no side effects outside snapshot
 *
 * Process:
 * 1. Retrieve snapshot for vehicleId
 * 2. Check if snapshot has sufficient data
 * 3. Call pure recommendation engine
 * 4. Call pure action engine to convert recommendations to actions (Phase 11.2)
 * 5. Store generated recommendations AND actions in snapshot
 * 6. Notify caller via optional callback (Phase 9.7.2: for React re-render trigger)
 * 7. Return safely (no exceptions thrown)
 *
 * @param vehicleId - Vehicle ID to generate recommendations for
 * @param onStored - Optional callback fired after recommendations/actions are stored (Phase 9.7.2)
 * @returns Promise<void> - Always resolves, never rejects
 */
export async function generateAndStoreVehicleRecommendations(
  vehicleId: string,
  onStored?: () => void
): Promise<void> {
  try {
    // Step 1: Get snapshot and wait for vehicleIntelligenceSummary to be available
    // Phase 9.7.1: Retry logic to handle race condition with event ingestion
    let snapshot = getSnapshot(vehicleId);
    
    if (!snapshot) {
      if (import.meta.env.DEV) {
        console.debug('[RecommendationOrchestrator] No snapshot found for', vehicleId);
      }
      return;
    }

    // Step 2: Wait for vehicleIntelligenceSummary to be populated by reducer
    // (event ingestion is async, so summary may not exist yet on first call)
    // Retry up to 10 times with 50ms delay between retries (500ms total max wait)
    let retries = 0;
    const MAX_RETRIES = 10;
    const RETRY_DELAY_MS = 50;

    while ((!snapshot.vehicleIntelligenceSummary) && retries < MAX_RETRIES) {
      if (import.meta.env.DEV && retries === 0) {
        console.debug('[RecommendationOrchestrator] Waiting for vehicleIntelligenceSummary...', {
          vehicleId,
          maxRetries: MAX_RETRIES,
          retryDelayMs: RETRY_DELAY_MS,
        });
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      
      // Re-read snapshot
      snapshot = getSnapshot(vehicleId);
      retries++;
    }

    // If summary still not available after retries, exit safely
    if (!snapshot.vehicleIntelligenceSummary) {
      if (import.meta.env.DEV) {
        console.debug('[RecommendationOrchestrator] Summary not available after retries', {
          vehicleId,
          retriesUsed: retries,
          totalWaitMs: retries * RETRY_DELAY_MS,
        });
      }
      return;
    }

    if (import.meta.env.DEV && retries > 0) {
      console.debug('[RecommendationOrchestrator] ✓ Summary became available', {
        vehicleId,
        retriesNeeded: retries,
        totalWaitMs: retries * RETRY_DELAY_MS,
        hasCompositeScore: !!snapshot.vehicleIntelligenceSummary.compositeScore,
      });
    }

    // Step 3: Check if snapshot has sufficient data for recommendations
    if (!isSnapshotSufficientForRecommendations(snapshot)) {
      if (import.meta.env.DEV) {
        console.debug('[RecommendationOrchestrator] Insufficient data for recommendations', { vehicleId });
      }
      return;
    }

    // Step 4: Generate recommendations using pure function
    // This is completely safe - no side effects, pure calculation
    const recommendations = generateVehicleIntelligenceRecommendations(snapshot);

    if (recommendations.length === 0) {
      if (import.meta.env.DEV) {
        console.debug('[RecommendationOrchestrator] No recommendations generated', { vehicleId });
      }
      return;
    }

    // Step 5: Generate vehicle actions from recommendations
    // Phase 11.2: Convert recommendations to structured operational tasks
    const actions = generateVehicleActionsFromRecommendations(recommendations);

    if (import.meta.env.DEV) {
      console.debug('[RecommendationOrchestrator] ✓ Actions generated from recommendations', {
        vehicleId,
        recommendationCount: recommendations.length,
        actionCount: actions.length,
      });
    }

    // Step 6: Store recommendations and actions in snapshot
    // Direct snapshot update - NOT through reducer, NO event emission
    const now = new Date().toISOString();
    const highSeverityCount = recommendations.filter(r => r.severity === 'high').length;
    
    upsertSnapshot(vehicleId, {
      vehicleIntelligenceRecommendations: recommendations,
      vehicleIntelligenceActions: actions,  // Phase 11.2: Store generated actions
      vehicleIntelligenceSummary: {
        ...(snapshot.vehicleIntelligenceSummary || {}),
        recommendationCount: recommendations.length,
        highSeverityRecommendationCount: highSeverityCount,
        lastRecommendationsUpdatedAt: now,
      },
      updatedAt: now, // Update snapshot timestamp
    });

    if (import.meta.env.DEV) {
      console.debug('[RecommendationOrchestrator] ✓ Recommendations and actions stored in snapshot', {
        vehicleId,
        recommendationCount: recommendations.length,
        actionCount: actions.length,
        severities: {
          high: recommendations.filter(r => r.severity === 'high').length,
          medium: recommendations.filter(r => r.severity === 'medium').length,
          low: recommendations.filter(r => r.severity === 'low').length,
        },
        actionTypes: Array.from(new Set(actions.map(a => a.actionType))),
        timestamp: now,
      });
    }

    // Phase 9.7.2: Notify caller (typically React component) that storage is complete
    // This allows UI to trigger re-render without modifying snapshot structure
    if (onStored) {
      if (import.meta.env.DEV) {
        console.debug('[RecommendationOrchestrator] Calling onStored callback', { vehicleId });
      }
      onStored();
    }
  } catch (error) {
    // Never throw - just log
    console.error('[RecommendationOrchestrator] Error generating/storing recommendations:', error);
  }
}

/**
 * Batch generate recommendations for multiple vehicles
 * Useful for bulk operations or admin panels
 *
 * @param vehicleIds - Array of vehicle IDs
 * @param onEachStored - Optional callback fired after each vehicle is processed
 * @returns Promise that resolves after all vehicles processed
 */
export async function generateAndStoreRecommendationsForBatch(
  vehicleIds: string[],
  onEachStored?: () => void
): Promise<void> {
  if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
    return;
  }

  if (import.meta.env.DEV) {
    console.debug('[RecommendationOrchestrator] Batch processing', vehicleIds.length, 'vehicles');
  }

  // Process sequentially to avoid thundering herd
  // Each call is independent and safe
  for (const vehicleId of vehicleIds) {
    await generateAndStoreVehicleRecommendations(vehicleId, onEachStored);
  }

  if (import.meta.env.DEV) {
    console.debug('[RecommendationOrchestrator] ✓ Batch processing complete');
  }
}
