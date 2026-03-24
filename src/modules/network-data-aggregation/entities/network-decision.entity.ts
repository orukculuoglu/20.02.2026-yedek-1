/**
 * MOTOR 3 — PHASE 14: NETWORK DECISION ENTITY
 * Immutable Entity Wrapper for Decision Modeling
 *
 * Scope:
 * - Entity layer only
 * - No decision logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate NetworkDecision contract in an immutable entity class.
 * Mirror contract structure with strict readonly enforcement.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type {
  NetworkDecision,
  NetworkDecisionType,
  NetworkDecisionPriority,
} from '../types/network-decision.types';

// ============================================================================
// CREATE NETWORK DECISION INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkDecisionEntity.
 * Contains all required fields for decision entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkDecisionInput {
  /**
   * Unique identifier for this decision.
   */
  readonly decisionId: string;

  /**
   * Source liquidity identifier that generated this decision.
   */
  readonly sourceLiquidityId: string;

  /**
   * Source pressure identifier for this decision.
   */
  readonly sourcePressureId: string;

  /**
   * Domain classification for this decision.
   */
  readonly domain: NetworkDomain;

  /**
   * Type of decision action.
   */
  readonly decisionType: NetworkDecisionType;

  /**
   * Priority level of decision execution.
   */
  readonly priority: NetworkDecisionPriority;

  /**
   * Timestamp when decision was created.
   * As ISO 8601 string.
   */
  readonly createdAt: string;

  /**
   * Rationale for this decision.
   */
  readonly rationale: string;

  /**
   * Metadata associated with this decision.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK DECISION ENTITY
// ============================================================================

/**
 * Immutable entity representation of a detected decision opportunity.
 * Wraps NetworkDecision contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkDecisionEntity implements NetworkDecision {
  readonly decisionId: string;
  readonly sourceLiquidityId: string;
  readonly sourcePressureId: string;
  readonly domain: NetworkDomain;
  readonly decisionType: NetworkDecisionType;
  readonly priority: NetworkDecisionPriority;
  readonly createdAt: string;
  readonly rationale: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkDecisionInput) {
    this.decisionId = input.decisionId;
    this.sourceLiquidityId = input.sourceLiquidityId;
    this.sourcePressureId = input.sourcePressureId;
    this.domain = input.domain;
    this.decisionType = input.decisionType;
    this.priority = input.priority;
    this.createdAt = input.createdAt;
    this.rationale = input.rationale;
    this.metadata = input.metadata;
  }
}
