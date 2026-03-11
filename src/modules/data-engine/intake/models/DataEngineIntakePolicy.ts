/**
 * Data Engine Intake Policy
 *
 * Defines source-aware, configurable intake evaluation behavior.
 * Controls whether issues are treated as warnings, rejections, or quarantines.
 */

import type { DataSourceType } from '../../types/DataSourceType';

/**
 * Intake Policy model.
 *
 * Configures how the intake layer evaluates feeds and handles issues.
 *
 * Design principle:
 * Different source types have different operational characteristics.
 * A policy allows flexible, source-aware intake decisions without
 * requiring a complex, hard-to-understand rule engine.
 */
export interface DataEngineIntakePolicy {
  /**
   * Global flag: whether non-blocking warnings prevent acceptance.
   * - true: Feed with BLOCKING issues only cannot be accepted
   * - false: Feed with any issues cannot be accepted
   */
  readonly allowWarnings: boolean;

  /**
   * Global flag: whether legacy conformance is acceptable.
   * Legacy feeds use older schema versions but are still operationally valuable.
   * - true: LEGACY_CONFORMANCE_WARNING does not block acceptance
   * - false: LEGACY_CONFORMANCE_WARNING triggers rejection
   */
  readonly acceptLegacyConformance: boolean;

  /**
   * Global flag: whether missing optional metadata triggers issues.
   * - true: Missing region, issuer, realm does not block acceptance
   * - false: Missing optional metadata triggers warnings or rejection
   */
  readonly tolerateMissingOptionalMetadata: boolean;

  /**
   * How to handle malformed timestamps.
   * - REJECT: Malformed timestamp = immediate rejection
   * - QUARANTINE: Malformed timestamp = quarantine for manual review
   * - WARN: Malformed timestamp = warning, acceptance continues
   */
  readonly malformedTimestampBehavior: 'REJECT' | 'QUARANTINE' | 'WARN';

  /**
   * Source-specific intake policies (optional).
   * Overrides global policy for specific source types.
   *
   * Example:
   *   LEGACY_INSURANCE_CONNECTOR: {
   *     acceptLegacyConformance: true,
   *     tolerateMissingOptionalMetadata: true,
   *     malformedTimestampBehavior: 'QUARANTINE'
   *   }
   *
   * Allows flexibility for known legacy systems while maintaining
   * stricter standards for modern sources.
   */
  readonly sourceSpecificPolicies?: Partial<Record<DataSourceType, {
    readonly acceptLegacyConformance?: boolean;
    readonly tolerateMissingOptionalMetadata?: boolean;
    readonly malformedTimestampBehavior?: 'REJECT' | 'QUARANTINE' | 'WARN';
  }>>;
}

/**
 * Default production intake policy.
 *
 * Reflects real-world operational tolerance:
 * - Allows warnings (not all issues are critical)
 * - Accepts legacy conformance with awareness
 * - Tolerates missing optional metadata (not all sources provide it)
 * - Quarantines malformed timestamps instead of hard-rejecting
 *
 * This is intentionally lenient while maintaining safety boundaries.
 */
export const defaultIntakePolicy: DataEngineIntakePolicy = {
  allowWarnings: true,
  acceptLegacyConformance: true,
  tolerateMissingOptionalMetadata: true,
  malformedTimestampBehavior: 'QUARANTINE',
};
