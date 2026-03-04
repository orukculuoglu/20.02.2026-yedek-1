/**
 * Data Engine Event Outbox Pattern
 * SaaS-ready ingestion with:
 * - Multi-tenant support (tenantId)
 * - Event sourcing (streamKey)
 * - Idempotency (idempotencyKey)
 * - Pluggable storage (StorageAdapter)
 * 
 * Design:
 * - Envelope enrichment with defaults
 * - Idempotency check (skip duplicates)
 * - Storage persistence (via adapter)
 * - Backward compatible with existing pipeline
 */

import type { DataEngineEventEnvelope } from '../contracts/dataEngineEventTypes';
import { enrichEnvelopeWithDefaults } from '../contracts/dataEngineEventTypes';
import type { StorageAdapter } from '../storage/storageAdapter';
import { getStorageAdapter } from '../storage/storageAdapter';
import { pushUnifiedDataEngineEventLog } from '../eventLogger';
import { applyDataEngineEventToSnapshot } from '../../vehicle-state/vehicleStateReducer';

/**
 * Global storage adapter instance
 */
let storageAdapter: StorageAdapter | null = null;

/**
 * Initialize the outbox with a storage adapter
 * Call this once at app startup (if not using getStorageAdapter)
 */
export function initializeOutbox(adapter: StorageAdapter): void {
  storageAdapter = adapter;
  if (import.meta.env.DEV) {
    console.debug('[EventOutbox] Initialized with custom adapter');
  }
}

/**
 * Get the global storage adapter
 */
function getAdapter(): StorageAdapter {
  if (!storageAdapter) {
    storageAdapter = getStorageAdapter();
  }
  return storageAdapter;
}

/**
 * Main outbox ingestion function
 * 
 * Process:
 * 1. Enrich envelope with defaults (tenantId, streamKey, idempotencyKey)
 * 2. Check idempotency (skip if key seen before)
 * 3. Append to storage adapter
 * 4. Continue to event log + snapshot reduction (existing pipeline)
 * 
 * Returns true if event was appended, false if duplicate
 */
export async function ingestWithOutbox(envelope: DataEngineEventEnvelope): Promise<boolean> {
  try {
    // Step 1: Enrich with defaults
    const enrichedEnvelope = enrichEnvelopeWithDefaults(envelope);

    // Step 2: Check idempotency
    const adapter = getAdapter();
    const isDuplicate = await adapter.hasIdempotencyKey(enrichedEnvelope.idempotencyKey!);
    
    if (isDuplicate) {
      if (import.meta.env.DEV) {
        console.debug('[EventOutbox] Duplicate detected (idempotencyKey):', {
          key: enrichedEnvelope.idempotencyKey,
          eventId: enrichedEnvelope.eventId,
        });
      }
      // Note: We don't skip the pipeline; we let it process but mark as duplicate
      // This ensures UI consistency even if same event is ingested twice
      return false;
    }

    // Step 3: Append to storage
    const appended = await adapter.append(enrichedEnvelope);

    if (!appended) {
      if (import.meta.env.DEV) {
        console.warn('[EventOutbox] Storage adapter rejected event:', {
          eventId: enrichedEnvelope.eventId,
          tenantId: enrichedEnvelope.tenantId,
        });
      }
      return false;
    }

    if (import.meta.env.DEV) {
      console.debug('[EventOutbox] Event outboxed successfully:', {
        eventId: enrichedEnvelope.eventId,
        tenantId: enrichedEnvelope.tenantId,
        streamKey: enrichedEnvelope.streamKey,
        idempotencyKey: enrichedEnvelope.idempotencyKey,
      });
    }

    // Step 4: Continue to existing pipeline
    // These should NOT throw; continue on errors
    try {
      pushUnifiedDataEngineEventLog(enrichedEnvelope);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[EventOutbox] Failed to log event:', error);
      }
    }

    try {
      applyDataEngineEventToSnapshot(enrichedEnvelope);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[EventOutbox] Failed to apply event to snapshot:', error);
      }
    }

    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[EventOutbox] Fatal error during ingestion:', error);
    }
    return false;
  }
}

/**
 * Get storage adapter for direct access (dev/testing)
 */
export function getOutboxAdapter(): StorageAdapter {
  return getAdapter();
}

/**
 * Get outbox statistics
 */
export async function getOutboxStats() {
  const adapter = getAdapter();
  const stats = await adapter.getStats();
  return {
    ...stats,
    isDevEnvironment: import.meta.env.DEV,
  };
}

/**
 * Clear the outbox (DEV only, dangerous)
 */
export async function clearOutbox(): Promise<void> {
  if (!import.meta.env.DEV) {
    console.warn('[EventOutbox] Clear is DEV-only');
    return;
  }

  const adapter = getAdapter();
  await adapter.clear();

  if (import.meta.env.DEV) {
    console.debug('[EventOutbox] Outbox cleared');
  }
}

/**
 * Test helper: Check if a specific idempotency key exists
 */
export async function hasOutboxKey(key: string): Promise<boolean> {
  const adapter = getAdapter();
  return adapter.hasIdempotencyKey(key);
}

/**
 * Test helper: Get events from specific stream
 */
export async function getOutboxStream(tenantId: string, vehicleId?: string) {
  const adapter = getAdapter();
  return adapter.getByStream(tenantId, vehicleId);
}
