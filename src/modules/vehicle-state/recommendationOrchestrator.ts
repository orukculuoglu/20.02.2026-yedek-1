/**
 * Recommendation Orchestrator
 * Phase 9.4: Async recommendation generation and snapshot storage
 *
 * Design:
 * - Pure function wrapper: Calls pure recommendation engine
 * - Async-safe: Can be called from any context without blocking
 * - Snapshot mutation: Updates snapshot with generated recommendations
 * - NO event emission: Just stores in snapshot
 * - NO reducer integration: Direct snapshot write
 * - Dormant by default: No automatic wiring
 *
 * Usage:
 * - Called manually by UI components (Phase 9.5)
 * - Called from async recommendation orchestration (Phase 9.4+)
 * - NOT called by reducer, aggregator, or ingestion
 */

import { generateVehicleIntelligenceRecommendations, isSnapshotSufficientForRecommendations } from '../data-engine/recommendations/recommendationEngine';
import { getSnapshot, upsertSnapshot } from './vehicleStateSnapshotStore';

/**
 * Generate vehicle intelligence recommendations and store in snapshot
 * Completely harmless async operation - no side effects outside snapshot
 *
 * Process:
 * 1. Retrieve snapshot for vehicleId
 * 2. Check if snapshot has sufficient data
 * 3. Call pure recommendation engine
 * 4. Store generated recommendations in snapshot.vehicleIntelligenceRecommendations
 * 5. Return safely (no exceptions thrown)
 *
 * @param vehicleId - Vehicle ID to generate recommendations for
 * @returns Promise<void> - Always resolves, never rejects
 */
export async function generateAndStoreVehicleRecommendations(vehicleId: string): Promise<void> {
  try {
    // Step 1: Get current snapshot
    const snapshot = getSnapshot(vehicleId);
    
    if (!snapshot) {
      if (import.meta.env.DEV) {
        console.debug('[RecommendationOrchestrator] No snapshot found for', vehicleId);
      }
      return;
    }

    // Step 2: Check if snapshot has sufficient data for recommendations
    if (!isSnapshotSufficientForRecommendations(snapshot)) {
      if (import.meta.env.DEV) {
        console.debug('[RecommendationOrchestrator] Insufficient data for recommendations', { vehicleId });
      }
      return;
    }

    // Step 3: Generate recommendations using pure function
    // This is completely safe - no side effects, pure calculation
    const recommendations = generateVehicleIntelligenceRecommendations(snapshot);

    if (recommendations.length === 0) {
      if (import.meta.env.DEV) {
        console.debug('[RecommendationOrchestrator] No recommendations generated', { vehicleId });
      }
      return;
    }

    // Step 4: Store recommendations and metadata in snapshot
    // Direct snapshot update - NOT through reducer, NO event emission
    const now = new Date().toISOString();
    const highSeverityCount = recommendations.filter(r => r.severity === 'high').length;
    
    upsertSnapshot(vehicleId, {
      vehicleIntelligenceRecommendations: recommendations,
      vehicleIntelligenceSummary: {
        ...(snapshot.vehicleIntelligenceSummary || {}),
        recommendationCount: recommendations.length,
        highSeverityRecommendationCount: highSeverityCount,
        lastRecommendationsUpdatedAt: now,
      },
      updatedAt: now, // Update snapshot timestamp
    });

    if (import.meta.env.DEV) {
      console.debug('[RecommendationOrchestrator] ✓ Recommendations stored in snapshot', {
        vehicleId,
        count: recommendations.length,
        severities: {
          high: recommendations.filter(r => r.severity === 'high').length,
          medium: recommendations.filter(r => r.severity === 'medium').length,
          low: recommendations.filter(r => r.severity === 'low').length,
        },
        timestamp: now,
      });
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
 * @returns Promise that resolves after all vehicles processed
 */
export async function generateAndStoreRecommendationsForBatch(vehicleIds: string[]): Promise<void> {
  if (!Array.isArray(vehicleIds) || vehicleIds.length === 0) {
    return;
  }

  if (import.meta.env.DEV) {
    console.debug('[RecommendationOrchestrator] Batch processing', vehicleIds.length, 'vehicles');
  }

  // Process sequentially to avoid thundering herd
  // Each call is independent and safe
  for (const vehicleId of vehicleIds) {
    await generateAndStoreVehicleRecommendations(vehicleId);
  }

  if (import.meta.env.DEV) {
    console.debug('[RecommendationOrchestrator] ✓ Batch processing complete');
  }
}
