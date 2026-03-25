/**
 * MOTOR 3 — PHASE 39: SNAPSHOT STORAGE RUNTIME
 * Deterministic Runtime for Snapshot Storage and Audit Operations
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No external calls
 * - No database
 * - No async
 * - No randomness
 * - No validation library
 *
 * Purpose:
 * Provide deterministic runtime functions for storing snapshots and
 * building audit results. Creates immutable records with full traceability.
 */

import type {
  StoredNetworkSnapshotRecord,
  NetworkSnapshotStoreWriteInput,
  NetworkSnapshotStoreWriteResult,
  NetworkSnapshotAuditResult,
} from '../types/network-snapshot-store.types';
import {
  StoredNetworkSnapshotRecordEntity,
  NetworkSnapshotStoreWriteResultEntity,
  NetworkSnapshotAuditResultEntity,
} from '../entities/network-snapshot-store.entity';

// ============================================================================
// SNAPSHOT STORAGE RUNTIME
// ============================================================================

/**
 * Store a NetworkSnapshot and return persisted record result.
 * Creates a stored record with deterministic record ID and storage timestamp.
 *
 * Processing:
 * - Generate record ID from snapshot ID: `record_${snapshotId}`
 * - Use snapshot's createdAt as storage timestamp
 * - Create stored record entity
 * - Wrap in write result entity
 * - Return plain contract object
 *
 * @param input NetworkSnapshotStoreWriteInput containing snapshot to store
 * @returns NetworkSnapshotStoreWriteResult with stored record
 */
export function storeNetworkSnapshot(
  input: NetworkSnapshotStoreWriteInput
): NetworkSnapshotStoreWriteResult {
  // Create stored record entity with deterministic record ID and timestamp
  const recordEntity = new StoredNetworkSnapshotRecordEntity({
    recordId: `record_${input.snapshot.snapshotId}`,
    snapshot: input.snapshot,
    storedAt: input.snapshot.createdAt,
  });

  // Create write result entity
  const resultEntity = new NetworkSnapshotStoreWriteResultEntity({
    record: recordEntity,
  });

  // Return plain contract object (not entity instance)
  return {
    record: {
      recordId: resultEntity.record.recordId,
      snapshot: resultEntity.record.snapshot,
      storedAt: resultEntity.record.storedAt,
    },
  };
}

/**
 * Build an audit result from a stored snapshot record.
 * Wraps the record in an audit result structure for query responses.
 *
 * Processing:
 * - Create audit result entity from the given record
 * - Return plain contract object
 *
 * @param record StoredNetworkSnapshotRecord to wrap in audit result
 * @returns NetworkSnapshotAuditResult containing the record
 */
export function buildNetworkSnapshotAuditResult(
  record: StoredNetworkSnapshotRecord
): NetworkSnapshotAuditResult {
  // Create audit result entity from the stored record
  // Note: Need to create a StoredNetworkSnapshotRecordEntity from the plain record
  const recordEntity = new StoredNetworkSnapshotRecordEntity({
    recordId: record.recordId,
    snapshot: record.snapshot,
    storedAt: record.storedAt,
  });

  // Create audit result entity
  const auditResultEntity = new NetworkSnapshotAuditResultEntity({
    record: recordEntity,
  });

  // Return plain contract object (not entity instance)
  return {
    record: {
      recordId: auditResultEntity.record.recordId,
      snapshot: auditResultEntity.record.snapshot,
      storedAt: auditResultEntity.record.storedAt,
    },
  };
}
