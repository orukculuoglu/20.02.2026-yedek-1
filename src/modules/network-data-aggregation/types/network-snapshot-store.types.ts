/**
 * MOTOR 3 — PHASE 37: SNAPSHOT STORAGE CONTRACT
 * Type Definitions for NetworkSnapshot Persistence and Audit
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No storage implementation
 * - No validation
 * - No guards
 * - No factories
 *
 * Purpose:
 * Define contracts for storing NetworkSnapshot records and querying
 * audit trail information. Provides immutable structures for snapshot
 * persistence layer and domain-based audit lookups.
 */

import type { NetworkDomain } from './network-foundation.types';
import type { NetworkSnapshot } from './network-snapshot.types';

// ============================================================================
// STORED NETWORK SNAPSHOT RECORD
// ============================================================================

/**
 * Persisted record of a NetworkSnapshot in storage.
 * Captures the snapshot together with storage metadata.
 *
 * Fields:
 * - recordId: Unique identifier for this stored record
 * - snapshot: Enriched NetworkSnapshot with full traceability
 * - storedAt: Timestamp when record was persisted
 *
 * Immutable contract: all fields readonly.
 */
export interface StoredNetworkSnapshotRecord {
  /**
   * Unique identifier for this stored record.
   * Identifies the storage entry, separate from snapshot ID.
   */
  readonly recordId: string;

  /**
   * Enriched network snapshot captured and stored.
   * Contains full traceability chain, temporal context, and metrics.
   */
  readonly snapshot: NetworkSnapshot;

  /**
   * Timestamp when record was stored.
   * As ISO 8601 string representing storage time.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly storedAt: string;
}

// ============================================================================
// NETWORK SNAPSHOT STORE WRITE INPUT
// ============================================================================

/**
 * Input contract for writing a NetworkSnapshot to storage.
 * Specifies the snapshot to persist.
 *
 * Fields:
 * - snapshot: NetworkSnapshot to write to storage
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkSnapshotStoreWriteInput {
  /**
   * Snapshot to persist in storage.
   * Contains full enrichment with trace, temporal context, and metrics.
   */
  readonly snapshot: NetworkSnapshot;
}

// ============================================================================
// NETWORK SNAPSHOT STORE WRITE RESULT
// ============================================================================

/**
 * Result of writing a NetworkSnapshot to storage.
 * Returns the stored record with persistence metadata.
 *
 * Fields:
 * - record: StoredNetworkSnapshotRecord with persistence info
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkSnapshotStoreWriteResult {
  /**
   * Stored snapshot record with persistence metadata.
   * Includes record ID and storage timestamp.
   */
  readonly record: StoredNetworkSnapshotRecord;
}

// ============================================================================
// NETWORK SNAPSHOT AUDIT QUERY
// ============================================================================

/**
 * Query parameters for auditing stored snapshots.
 * Specifies domain and snapshot ID to locate in audit trail.
 *
 * Fields:
 * - domain: NetworkDomain to filter snapshots by
 * - snapshotId: Snapshot ID to look up
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkSnapshotAuditQuery {
  /**
   * Domain filter for snapshot lookup.
   * Narrows audit trail to specific business domain.
   */
  readonly domain: NetworkDomain;

  /**
   * Snapshot ID to locate in audit trail.
   * Identifies the specific snapshot record to retrieve.
   */
  readonly snapshotId: string;
}

// ============================================================================
// NETWORK SNAPSHOT AUDIT RESULT
// ============================================================================

/**
 * Result of auditing stored snapshots by domain and ID.
 * Returns the stored record matching the audit query.
 *
 * Fields:
 * - record: StoredNetworkSnapshotRecord matching the query
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkSnapshotAuditResult {
  /**
   * Stored snapshot record matching the audit query.
   * Contains snapshot, record ID, and storage timestamp.
   */
  readonly record: StoredNetworkSnapshotRecord;
}
