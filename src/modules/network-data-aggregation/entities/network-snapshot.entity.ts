/**
 * MOTOR 3 — PHASE 17: SNAPSHOT ENTITY
 * Immutable Entity Wrappers for Snapshot and Trace Modeling
 *
 * Scope:
 * - Entity layer only
 * - No snapshot generation logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate NetworkTraceRef and NetworkSnapshot contracts in immutable entity classes.
 * Mirror contract structures with strict readonly enforcement.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type {
  NetworkTraceRef,
  NetworkSnapshot,
} from '../types/network-snapshot.types';

// ============================================================================
// CREATE NETWORK TRACE REF INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkTraceRefEntity.
 * Contains all required fields for trace ref entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkTraceRefInput {
  /**
   * Source event identifier.
   */
  readonly sourceEventId: string;

  /**
   * Derived pressure identifier.
   */
  readonly pressureId: string;

  /**
   * Derived liquidity identifier.
   */
  readonly liquidityId: string;

  /**
   * Final decision identifier.
   */
  readonly decisionId: string;
}

// ============================================================================
// NETWORK TRACE REF ENTITY
// ============================================================================

/**
 * Immutable entity representation of trace reference.
 * Wraps NetworkTraceRef contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkTraceRefEntity implements NetworkTraceRef {
  readonly sourceEventId: string;
  readonly pressureId: string;
  readonly liquidityId: string;
  readonly decisionId: string;

  constructor(input: CreateNetworkTraceRefInput) {
    this.sourceEventId = input.sourceEventId;
    this.pressureId = input.pressureId;
    this.liquidityId = input.liquidityId;
    this.decisionId = input.decisionId;
  }
}

// ============================================================================
// CREATE NETWORK SNAPSHOT INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkSnapshotEntity.
 * Contains all required fields for snapshot entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkSnapshotInput {
  /**
   * Unique identifier for this snapshot.
   */
  readonly snapshotId: string;

  /**
   * Domain classification for this snapshot.
   */
  readonly domain: NetworkDomain;

  /**
   * Trace reference for complete audit trail.
   */
  readonly traceRef: NetworkTraceRefEntity;

  /**
   * Timestamp when snapshot was created.
   * As ISO 8601 string.
   */
  readonly createdAt: string;

  /**
   * Metadata associated with this snapshot.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK SNAPSHOT ENTITY
// ============================================================================

/**
 * Immutable entity representation of a network intelligence snapshot.
 * Wraps NetworkSnapshot contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkSnapshotEntity implements NetworkSnapshot {
  readonly snapshotId: string;
  readonly domain: NetworkDomain;
  readonly traceRef: NetworkTraceRefEntity;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkSnapshotInput) {
    this.snapshotId = input.snapshotId;
    this.domain = input.domain;
    this.traceRef = input.traceRef;
    this.createdAt = input.createdAt;
    this.metadata = input.metadata;
  }
}
