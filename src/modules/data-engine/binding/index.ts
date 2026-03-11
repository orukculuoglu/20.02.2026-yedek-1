/**
 * Data Engine Binding Module
 *
 * Phase 3: Identity Resolution Binding
 *
 * This module evaluates whether accepted feeds from Phase 2 can be reliably bound
 * to their provided anonymous vehicle identity context.
 *
 * The binding layer answers:
 * "Can this feed's identity context be trusted for downstream processing?"
 *
 * It does NOT answer identity creation, resolution, VIN lookup, normalization,
 * or graph construction questions. Those are responsibilities of other layers.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

export type { DataEngineBindingStatus } from './types/DataEngineBindingStatus';

export { DataEngineBindingIssueCode } from './types/DataEngineBindingIssueCode';

// ─────────────────────────────────────────────────────────────────────────────
// Model Exports
// ─────────────────────────────────────────────────────────────────────────────

export type { DataEngineBindingIssue } from './models/DataEngineBindingIssue';

export type {
  DataEngineIdentityBindingPolicy,
} from './models/DataEngineIdentityBindingPolicy';
export {
  defaultBindingPolicy,
  strictBindingPolicy,
  lenientBindingPolicy,
} from './models/DataEngineIdentityBindingPolicy';

export type {
  DataEngineIdentityBindingCandidate,
  DataEngineIdentityContext,
} from './models/DataEngineIdentityBindingCandidate';

export type {
  DataEngineIdentityBindingResult,
} from './models/DataEngineIdentityBindingResult';

export { evaluateIdentityBinding } from './models/evaluateIdentityBinding';

// ─────────────────────────────────────────────────────────────────────────────
// Example Cases (for documentation and testing)
// ─────────────────────────────────────────────────────────────────────────────

export {
  caseServiceCenterFullyTrusted,
  caseTelematicsIncompleteFedetation,
  caseFleetRevokedIdentity,
  caseInsuranceExpiredIdentity,
  casePartnerStaleIdentity,
  caseManufacturerIssuerMismatch,
  caseLowTrustPartnerAcceptable,
  caseMissingIssuerContext,
  caseEnvironmentMismatch,
} from './examples/exampleBindingCases';

/**
 * Phase 3 Summary
 *
 * The binding layer is responsible for evaluating identity context quality,
 * not identity creation or resolution.
 *
 * Key principles:
 *
 * 1. Identity presence ≠ binding validity
 *    A feed may contain identityId and still fail binding quality checks.
 *
 * 2. Real-world nuance
 *    Not all identity context is perfect. The binding layer distinguishes between:
 *    - BOUND: Full confidence
 *    - BOUND_WITH_LIMITATIONS: Acceptable with operational caution
 *    - QUARANTINED: Needs manual review before proceeding
 *    - REJECTED: Unacceptable identity context
 *    - UNRESOLVED: Insufficient context to decide
 *
 * 3. Policy-aware flexibility
 *    Different sources, partnerships, and scenarios demand different thresholds.
 *    Default policy is lenient (allows low-trust, incomplete federation).
 *    Strict and lenient variants available for different contexts.
 *
 * 4. Clear separation of concerns
 *    This phase evaluates identity binding quality only.
 *    Downstream layers handle normalization, canonicalization, graph building, etc.
 *
 * 5. Auditability and determinism
 *    Every binding decision is fully documented with issues, policy, and reasoning.
 *    Same input + same policy = same output (no external dependencies, no randomness).
 */
