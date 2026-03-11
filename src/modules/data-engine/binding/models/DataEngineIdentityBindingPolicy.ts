/**
 * Data Engine Identity Binding Policy
 *
 * Configures how binding evaluation handles identity context quality concerns.
 * Defines source-aware, trust-aware thresholds for binding outcomes.
 */

import type { DataSourceType } from '../../types/DataSourceType';

/**
 * Identity Binding Policy model.
 *
 * Controls decision thresholds during binding evaluation.
 * Allows different operational tolerance levels for different source types and trust contexts.
 *
 * Design principle:
 * Not all feeds require maximum identity context confidence.
 * Some sources (legacy, semi-trusted partners) operate with reasonable binding confidence
 * even when full context is unavailable.
 * Policy allows intelligent operational flexibility.
 */
export interface DataEngineIdentityBindingPolicy {
  /**
   * Global: whether low-trust identities can proceed with binding limitations.
   * - true: LOW_TRUST_BINDING issues permit BOUND_WITH_LIMITATIONS
   * - false: LOW_TRUST_BINDING issues cause REJECTED or QUARANTINED
   */
  readonly allowLowTrustBinding: boolean;

  /**
   * Global: whether incomplete federation context is tolerated.
   * - true: INCOMPLETE_FEDERATION_CONTEXT produces BOUND_WITH_LIMITATIONS
   * - false: INCOMPLETE_FEDERATION_CONTEXT causes REJECTED or QUARANTINED
   */
  readonly tolerateIncompleteFederationContext: boolean;

  /**
   * How to handle environment mismatch.
   * - REJECT: Environment mismatch → REJECTED
   * - QUARANTINE: Environment mismatch → QUARANTINED for review
   * - WARN: Environment mismatch → BOUND_WITH_LIMITATIONS or BOUND depending on policy
   */
  readonly environmentMismatchBehavior: 'REJECT' | 'QUARANTINE' | 'WARN';

  /**
   * How to handle scope mismatch.
   * - REJECT: Scope mismatch → REJECTED
   * - QUARANTINE: Scope mismatch → QUARANTINED for review
   * - WARN: Scope mismatch → warning, permit binding with limitations
   */
  readonly scopeMismatchBehavior: 'REJECT' | 'QUARANTINE' | 'WARN';

  /**
   * How to handle expired identities.
   * - REJECT: Expired identity → REJECTED (hard boundary)
   * - QUARANTINE: Expired identity → QUARANTINED for manual policy review
   * - WARN: Expired identity → warning, permit binding with limitations (lenient)
   */
  readonly expiredIdentityBehavior: 'REJECT' | 'QUARANTINE' | 'WARN';

  /**
   * How to handle revoked identities.
   * - REJECT: Revoked identity → REJECTED (always, by default)
   * - QUARANTINE: Revoked identity → QUARANTINED (unusual, but allowed for special cases)
   *
   * Note: REVOKED_IDENTITY is almost always hard-blocking.
   * This policy option exists for edge cases only.
   */
  readonly revokedIdentityBehavior: 'REJECT' | 'QUARANTINE';

  /**
   * How to handle stale identities (beyond expected age).
   * - REJECT: Stale identity → REJECTED
   * - QUARANTINE: Stale identity → QUARANTINED for review
   * - WARN: Stale identity → warning, permit binding
   *
   * Example: Identity is 4 years old; policy may quarantine versus allow.
   */
  readonly staleIdentityBehavior: 'REJECT' | 'QUARANTINE' | 'WARN';

  /**
   * Maximum acceptable identity age in milliseconds.
   * If identity is older than this, IDENTITY_STALE is raised.
   *
   * Example: 5 * 365.25 * 24 * 60 * 60 * 1000 = 5 years
   * Set to 0 to disable stale age checking.
   */
  readonly maxIdentityAgeMillis: number;

  /**
   * How to handle issuer mismatch.
   * - REJECT: Issuer mismatch → REJECTED
   * - QUARANTINE: Issuer mismatch → QUARANTINED for review
   * - WARN: Issuer mismatch → warning, permit binding wit limitations
   *
   * Issuer mismatch is serious and should usually cause quarantine or rejection.
   */
  readonly issuerMismatchBehavior: 'REJECT' | 'QUARANTINE' | 'WARN';

  /**
   * How to handle ambiguous binding contexts.
   * - REJECT: Ambiguous context → REJECTED
   * - QUARANTINE: Ambiguous context → QUARANTINED for manual clarification
   */
  readonly ambiguousContextBehavior: 'REJECT' | 'QUARANTINE';

  /**
   * Minimum trust level required for binding without limitations.
   * Trust levels typically: 'LOW', 'MEDIUM', 'HIGH'
   *
   * If identity trustLevel is below this, LOW_TRUST_BINDING is raised.
   * Whether this causes BOUND_WITH_LIMITATIONS or rejection depends on allowLowTrustBinding.
   *
   * Example: 'MEDIUM' means only MEDIUM or HIGH trust reaches full BOUND.
   */
  readonly minimumTrustLevel: 'LOW' | 'MEDIUM' | 'HIGH';

  /**
   * Source-specific binding policies (optional).
   * Overrides global policy for specific source types.
   *
   * Example:
   *   {
   *     LEGACY_INSURANCE_CONNECTOR: {
   *       allowLowTrustBinding: true,
   *       tolerateIncompleteFederationContext: true,
   *       environmentMismatchBehavior: 'WARN',
   *       minimumTrustLevel: 'LOW'
   *     }
   *   }
   *
   * Allows flexibility for known legacy or semi-trusted systems
   * while maintaining stricter standards for modern sources.
   */
  readonly sourceSpecificPolicies?: Partial<Record<DataSourceType, Partial<{
    readonly allowLowTrustBinding?: boolean;
    readonly tolerateIncompleteFederationContext?: boolean;
    readonly environmentMismatchBehavior?: 'REJECT' | 'QUARANTINE' | 'WARN';
    readonly scopeMismatchBehavior?: 'REJECT' | 'QUARANTINE' | 'WARN';
    readonly expiredIdentityBehavior?: 'REJECT' | 'QUARANTINE' | 'WARN';
    readonly revokedIdentityBehavior?: 'REJECT' | 'QUARANTINE';
    readonly staleIdentityBehavior?: 'REJECT' | 'QUARANTINE' | 'WARN';
    readonly maxIdentityAgeMillis?: number;
    readonly issuerMismatchBehavior?: 'REJECT' | 'QUARANTINE' | 'WARN';
    readonly ambiguousContextBehavior?: 'REJECT' | 'QUARANTINE';
    readonly minimumTrustLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  }>>>;
}

/**
 * Default production binding policy.
 *
 * Reflects real-world operational tolerance for automotive and fleet scenarios.
 *
 * Design rationale:
 * - Allows low-trust binding (many operational feeds are from lower-confidence sources)
 * - Tolerates incomplete federation context (not all partners provide full federation context)
 * - Warns on environment mismatch rather than hard-rejecting (some feeds cross environments)
 * - Quarantines expired identities rather than rejecting (age is reviewable)
 * - Always rejects revoked identities (non-negotiable)
 * - Quarantines stale identities for review (operational evaluation needed)
 * - Rejects issuer mismatch (critical for security)
 * - Quarantines ambiguous contexts (requires manual clarification)
 * - Accepts MEDIUM trust level as minimum (HIGH reserved for critical identity scenarios)
 * - Maximum identity age of 5 years (reasonable for long-lived vehicle identities)
 */
export const defaultBindingPolicy: DataEngineIdentityBindingPolicy = {
  allowLowTrustBinding: true,
  tolerateIncompleteFederationContext: true,
  environmentMismatchBehavior: 'WARN',
  scopeMismatchBehavior: 'QUARANTINE',
  expiredIdentityBehavior: 'QUARANTINE',
  revokedIdentityBehavior: 'REJECT',
  staleIdentityBehavior: 'QUARANTINE',
  maxIdentityAgeMillis: 5 * 365.25 * 24 * 60 * 60 * 1000, // 5 years
  issuerMismatchBehavior: 'REJECT',
  ambiguousContextBehavior: 'QUARANTINE',
  minimumTrustLevel: 'MEDIUM',
};

/**
 * Strict binding policy for high-security scenarios.
 *
 * Used for critical identity contexts where full confidence is required.
 */
export const strictBindingPolicy: DataEngineIdentityBindingPolicy = {
  allowLowTrustBinding: false,
  tolerateIncompleteFederationContext: false,
  environmentMismatchBehavior: 'REJECT',
  scopeMismatchBehavior: 'REJECT',
  expiredIdentityBehavior: 'REJECT',
  revokedIdentityBehavior: 'REJECT',
  staleIdentityBehavior: 'REJECT',
  maxIdentityAgeMillis: 1 * 365.25 * 24 * 60 * 60 * 1000, // 1 year
  issuerMismatchBehavior: 'REJECT',
  ambiguousContextBehavior: 'REJECT',
  minimumTrustLevel: 'HIGH',
};

/**
 * Lenient binding policy for legacy and semi-trusted partner systems.
 *
 * Used for known legacy connectors and partner systems with operational history
 * but limited identity context sophistication.
 */
export const lenientBindingPolicy: DataEngineIdentityBindingPolicy = {
  allowLowTrustBinding: true,
  tolerateIncompleteFederationContext: true,
  environmentMismatchBehavior: 'WARN',
  scopeMismatchBehavior: 'WARN',
  expiredIdentityBehavior: 'WARN',
  revokedIdentityBehavior: 'QUARANTINE',
  staleIdentityBehavior: 'WARN',
  maxIdentityAgeMillis: 10 * 365.25 * 24 * 60 * 60 * 1000, // 10 years
  issuerMismatchBehavior: 'QUARANTINE',
  ambiguousContextBehavior: 'QUARANTINE',
  minimumTrustLevel: 'LOW',
};
