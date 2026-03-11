/**
 * Data Engine Binding Status
 *
 * Represents the deterministic outcome of identity binding evaluation.
 * Answers: "Can this feed's identity context be reliably used downstream?"
 */

/**
 * Binding decision status.
 *
 * BOUND:
 *   Identity context is sufficient and trustworthy for downstream use.
 *   All critical identity context fields are present and valid.
 *   Issuer, scope, and environment are compatible.
 *   Temporal validity is within acceptable range.
 *   Trust level is adequate.
 *
 * BOUND_WITH_LIMITATIONS:
 *   Identity context supports binding but with known limitations.
 *   Feed can proceed downstream with operational awareness.
 *   Examples:
 *   - Valid identity but incomplete federation context
 *   - Valid identity but semi-trusted partner source
 *   - Valid identity but limited issuer metadata
 *   - Valid identity with temporal warning but still within tolerance
 *   Downstream systems must respect the limitation flag.
 *
 * UNRESOLVED:
 *   Identity context lacks minimum fields required for safe downstream use.
 *   Cannot determine binding quality or trustworthiness.
 *   Feed cannot proceed; upstream must provide more identity context.
 *   Example: identityId present but missing all issuer context.
 *
 * REJECTED:
 *   Identity context fails binding requirements and cannot be remedied
 *   by providing more information.
 *   Feed must be rejected entirely.
 *   Examples:
 *   - Revoked identity
 *   - Expired identity (if policy enforces hard expiration)
 *   - Identity mismatch with source type
 *
 * QUARANTINED:
 *   Identity context contains ambiguous or suspicious characteristics
 *   that require manual review before downstream use.
 *   Examples:
 *   - Issuer context is ambiguous
 *   - Environment mismatch with known safe set
 *   - Malformed federation context
 *   - Identity age beyond expected range
 */
export type DataEngineBindingStatus =
  | 'BOUND'
  | 'BOUND_WITH_LIMITATIONS'
  | 'UNRESOLVED'
  | 'REJECTED'
  | 'QUARANTINED';
