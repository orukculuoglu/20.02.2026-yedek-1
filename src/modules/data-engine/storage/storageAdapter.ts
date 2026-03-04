/**
 * Storage Adapter Interface
 * Abstraction layer for event persistence
 * 
 * Supports:
 * - DEV: localStorage + in-memory
 * - PROD: API/database backend
 * - Future: Cloud Firestore, DynamoDB, etc.
 */

import type { DataEngineEventEnvelope } from '../contracts/dataEngineEventTypes';

/**
 * Storage statistics
 */
export interface StorageStats {
  count: number;                    // Total events stored
  tenantIds: string[];              // Unique tenant IDs
  lastAppendedAt?: string;          // ISO timestamp of last append
}

/**
 * Abstract storage adapter for data engine events
 */
export interface StorageAdapter {
  /**
   * Append an event to storage
   * Returns true if appended, false if duplicate (idempotency)
   */
  append(envelope: DataEngineEventEnvelope): Promise<boolean>;

  /**
   * Get all stored events
   */
  getAll(): Promise<DataEngineEventEnvelope[]>;

  /**
   * Get events filtered by tenant and/or stream
   */
  getByStream(tenantId: string, vehicleId?: string): Promise<DataEngineEventEnvelope[]>;

  /**
   * Check if an idempotency key has been seen before
   */
  hasIdempotencyKey(key: string): Promise<boolean>;

  /**
   * Get storage statistics
   */
  getStats(): Promise<StorageStats>;

  /**
   * Clear all events (DEV only)
   */
  clear(): Promise<void>;
}

/**
 * Dev-only storage adapter using localStorage + memory
 * Used by default in development mode
 */
export class DevStorageAdapter implements StorageAdapter {
  private idempotencySeenKeys: Set<string> = new Set();
  private readonly storageKey = 'LENT_DATA_ENGINE_OUTBOX_V1';
  private readonly maxEvents = 500;

  constructor() {
    this.loadIdempotencyKeys();
  }

  private loadIdempotencyKeys(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(`${this.storageKey}:IDEMPOTENCY`);
      if (stored) {
        const keys = JSON.parse(stored);
        this.idempotencySeenKeys = new Set(keys);
      }
    } catch (error) {
      console.warn('[StorageAdapter] Failed to load idempotency keys:', error);
    }
  }

  private saveIdempotencyKeys(): void {
    if (typeof window === 'undefined') return;
    try {
      const keys = Array.from(this.idempotencySeenKeys);
      localStorage.setItem(`${this.storageKey}:IDEMPOTENCY`, JSON.stringify(keys));
    } catch (error) {
      console.warn('[StorageAdapter] Failed to save idempotency keys:', error);
    }
  }

  async append(envelope: DataEngineEventEnvelope): Promise<boolean> {
    const idempotencyKey = envelope.idempotencyKey || envelope.eventId;

    // Check idempotency
    if (this.idempotencySeenKeys.has(idempotencyKey)) {
      if (import.meta.env.DEV) {
        console.debug('[StorageAdapter] Idempotency: Skipping duplicate key:', idempotencyKey);
      }
      return false; // Duplicate
    }

    // Get existing events
    let events: DataEngineEventEnvelope[] = await this.getAll();

    // Append
    events.push(envelope);

    // Maintain limit (keep newest)
    if (events.length > this.maxEvents) {
      events = events.slice(-this.maxEvents);
    }

    // Save
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(events));
      }
    } catch (error) {
      console.warn('[StorageAdapter] Failed to append event:', error);
      return false;
    }

    // Track idempotency
    this.idempotencySeenKeys.add(idempotencyKey);
    // Keep last 500 keys only
    if (this.idempotencySeenKeys.size > 500) {
      const keys = Array.from(this.idempotencySeenKeys);
      this.idempotencySeenKeys = new Set(keys.slice(-500));
    }
    this.saveIdempotencyKeys();

    if (import.meta.env.DEV) {
      console.debug('[StorageAdapter] Event appended:', {
        eventId: envelope.eventId,
        totalCount: events.length,
        tenantId: envelope.tenantId || 'dev',
      });
    }

    return true;
  }

  async getAll(): Promise<DataEngineEventEnvelope[]> {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[StorageAdapter] Failed to read events:', error);
    }

    return [];
  }

  async getByStream(tenantId: string, vehicleId?: string): Promise<DataEngineEventEnvelope[]> {
    const all = await this.getAll();
    return all.filter(evt => {
      if (evt.tenantId !== tenantId) return false;
      if (vehicleId && evt.vehicleId !== vehicleId) return false;
      return true;
    });
  }

  async hasIdempotencyKey(key: string): Promise<boolean> {
    return this.idempotencySeenKeys.has(key);
  }

  async getStats(): Promise<StorageStats> {
    const all = await this.getAll();
    const tenantIds = Array.from(new Set(all.map(evt => evt.tenantId || 'dev')));
    return {
      count: all.length,
      tenantIds,
      lastAppendedAt: all.length > 0 ? all[all.length - 1].occurredAt : undefined,
    };
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(`${this.storageKey}:IDEMPOTENCY`);
      this.idempotencySeenKeys.clear();
      if (import.meta.env.DEV) {
        console.debug('[StorageAdapter] Storage cleared');
      }
    } catch (error) {
      console.warn('[StorageAdapter] Failed to clear storage:', error);
    }
  }
}

/**
 * Production stub adapter (no-op, for when backend API is not ready)
 */
export class ProdStorageAdapter implements StorageAdapter {
  async append(envelope: DataEngineEventEnvelope): Promise<boolean> {
    // TODO: Send to backend API
    // For now, silently succeed (events are not persisted)
    if (import.meta.env.DEV) {
      console.debug('[StorageAdapter-Prod] Event would be sent to backend:', envelope.eventId);
    }
    return true;
  }

  async getAll(): Promise<DataEngineEventEnvelope[]> {
    // TODO: Fetch from backend API
    return [];
  }

  async getByStream(tenantId: string, vehicleId?: string): Promise<DataEngineEventEnvelope[]> {
    // TODO: Fetch from backend API with filters
    return [];
  }

  async hasIdempotencyKey(key: string): Promise<boolean> {
    // TODO: Query backend API
    return false;
  }

  async getStats(): Promise<StorageStats> {
    // TODO: Query backend API
    return { count: 0, tenantIds: [] };
  }

  async clear(): Promise<void> {
    // TODO: Call backend API
    if (import.meta.env.DEV) {
      console.debug('[StorageAdapter-Prod] Clear not implemented for production');
    }
  }
}

/**
 * Get appropriate storage adapter based on environment
 */
export function getStorageAdapter(): StorageAdapter {
  if (import.meta.env.DEV) {
    return new DevStorageAdapter();
  } else {
    return new ProdStorageAdapter();
  }
}
