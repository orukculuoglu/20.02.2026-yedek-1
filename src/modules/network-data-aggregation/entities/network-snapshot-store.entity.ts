/**
 * MOTOR 3 — PHASE 38: SNAPSHOT STORAGE ENTITY
 * Immutable Entity Wrappers for Snapshot Storage and Audit Contracts
 *
 * Scope:
 * - Entity layer only
 * - No storage logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate StoredNetworkSnapshotRecord, NetworkSnapshotStoreWriteResult,
 * and NetworkSnapshotAuditResult contracts in immutable entity classes.
 * Mirror contract structures with strict readonly enforcement.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type { NetworkSnapshot } from '../types/network-snapshot.types';
import type {
  StoredNetworkSnapshotRecord,
  NetworkSnapshotStoreWriteInput,
  NetworkSnapshotStoreWriteResult,
  NetworkSnapshotAuditQuery,
  NetworkSnapshotAuditResult,
} from '../types/network-snapshot-store.types';

// ============================================================================
// CREATE STORED NETWORK SNAPSHOT RECORD INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a StoredNetworkSnapshotRecordEntity.
 * Contains all required fields for snapshot storage record entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateStoredNetworkSnapshotRecordInput {
  /**
   * Unique identifier for this stored record.
   */
  readonly recordId: string;

  /**
   * Enriched network snapshot to store.
   */
  readonly snapshot: NetworkSnapshot;

  /**
   * Timestamp when record was stored.
   * As ISO 8601 string.
   */
  readonly storedAt: string;
}

// ============================================================================
// STORED NETWORK SNAPSHOT RECORD ENTITY
// ============================================================================

/**
 * Immutable entity representation of a stored snapshot record.
 * Wraps StoredNetworkSnapshotRecord contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class StoredNetworkSnapshotRecordEntity implements StoredNetworkSnapshotRecord {
  readonly recordId: string;
  readonly snapshot: NetworkSnapshot;
  readonly storedAt: string;

  constructor(input: CreateStoredNetworkSnapshotRecordInput) {
    this.recordId = input.recordId;
    this.snapshot = input.snapshot;
    this.storedAt = input.storedAt;
  }
}

// ============================================================================
// CREATE NETWORK SNAPSHOT STORE WRITE INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkSnapshotStoreWriteInputEntity.
 * Contains all required fields for write input entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkSnapshotStoreWriteInput {
  /**
   * Snapshot to persist in storage.
   */
  readonly snapshot: NetworkSnapshot;
}

// ============================================================================
// NETWORK SNAPSHOT STORE WRITE INPUT ENTITY
// ============================================================================

/**
 * Immutable entity representation of a store write input.
 * Wraps NetworkSnapshotStoreWriteInput contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkSnapshotStoreWriteInputEntity implements NetworkSnapshotStoreWriteInput {
  readonly snapshot: NetworkSnapshot;

  constructor(input: CreateNetworkSnapshotStoreWriteInput) {
    this.snapshot = input.snapshot;
  }
}

// ============================================================================
// CREATE NETWORK SNAPSHOT STORE WRITE RESULT INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkSnapshotStoreWriteResultEntity.
 * Contains all required fields for write result entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkSnapshotStoreWriteResultInput {
  /**
   * Stored snapshot record with persistence metadata.
   */
  readonly record: StoredNetworkSnapshotRecordEntity;
}

// ============================================================================
// NETWORK SNAPSHOT STORE WRITE RESULT ENTITY
// ============================================================================

/**
 * Immutable entity representation of a store write result.
 * Wraps NetworkSnapshotStoreWriteResult contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 * Stores StoredNetworkSnapshotRecordEntity internally for entity-to-entity consistency.
 */
export class NetworkSnapshotStoreWriteResultEntity implements NetworkSnapshotStoreWriteResult {
  readonly record: StoredNetworkSnapshotRecordEntity;

  constructor(input: CreateNetworkSnapshotStoreWriteResultInput) {
    this.record = input.record;
  }
}

// ============================================================================
// CREATE NETWORK SNAPSHOT AUDIT QUERY INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkSnapshotAuditQueryEntity.
 * Contains all required fields for audit query entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkSnapshotAuditQueryInput {
  /**
   * Domain filter for snapshot lookup.
   */
  readonly domain: NetworkDomain;

  /**
   * Snapshot ID to locate in audit trail.
   */
  readonly snapshotId: string;
}

// ============================================================================
// NETWORK SNAPSHOT AUDIT QUERY ENTITY
// ============================================================================

/**
 * Immutable entity representation of an audit query.
 * Wraps NetworkSnapshotAuditQuery contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkSnapshotAuditQueryEntity implements NetworkSnapshotAuditQuery {
  readonly domain: NetworkDomain;
  readonly snapshotId: string;

  constructor(input: CreateNetworkSnapshotAuditQueryInput) {
    this.domain = input.domain;
    this.snapshotId = input.snapshotId;
  }
}

// ============================================================================
// CREATE NETWORK SNAPSHOT AUDIT RESULT INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkSnapshotAuditResultEntity.
 * Contains all required fields for audit result entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkSnapshotAuditResultInput {
  /**
   * Stored snapshot record matching the audit query.
   */
  readonly record: StoredNetworkSnapshotRecordEntity;
}

// ============================================================================
// NETWORK SNAPSHOT AUDIT RESULT ENTITY
// ============================================================================

/**
 * Immutable entity representation of an audit result.
 * Wraps NetworkSnapshotAuditResult contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 * Stores StoredNetworkSnapshotRecordEntity internally for entity-to-entity consistency.
 */
export class NetworkSnapshotAuditResultEntity implements NetworkSnapshotAuditResult {
  readonly record: StoredNetworkSnapshotRecordEntity;

  constructor(input: CreateNetworkSnapshotAuditResultInput) {
    this.record = input.record;
  }
}
