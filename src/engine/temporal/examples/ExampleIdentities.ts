/**
 * Example Identities
 * Concrete canonical window identity examples for verification and testing.
 * All values are deterministic and explicitly defined.
 */

import type { CanonicalWindowIdentity } from "../entities/WindowIdentity.ts";
import type { TemporalWindowIdentifier } from "../entities/WindowIdentity.ts";

/**
 * Example canonical window identities with explicit, deterministic values.
 * Identifiers, timestamps, types, and roles are all explicitly specified.
 */
export class ExampleIdentities {
  /**
   * Primary reference window identity
   * Type: REFERENCE, Role: PRIMARY
   * Created: 2026-04-05T10:00:00Z (Unix ms: 1744077600000)
   * Identifier assigned: 2026-03-01T00:00:00Z (Unix ms: 1743638400000)
   */
  static readonly PRIMARY_REFERENCE_IDENTITY: CanonicalWindowIdentity = {
    identifier: {
      id: "win-ref-001",
      generatedAt: 1743638400000,    // When identifier was assigned
      source: "provided",
    } as TemporalWindowIdentifier,
    windowType: "REFERENCE",
    windowRole: "PRIMARY",
    createdAt: 1744077600000,
    version: "1.0.0",
  };

  /**
   * Secondary comparison window identity
   * Type: COMPARISON, Role: SECONDARY
   * Created: 2026-04-05T10:15:00Z (Unix ms: 1744078500000)
   * Identifier assigned: 2026-03-05T00:00:00Z (Unix ms: 1743897600000)
   */
  static readonly SECONDARY_COMPARISON_IDENTITY: CanonicalWindowIdentity = {
    identifier: {
      id: "win-comp-001",
      generatedAt: 1743897600000,
      source: "provided",
    } as TemporalWindowIdentifier,
    windowType: "COMPARISON",
    windowRole: "SECONDARY",
    createdAt: 1744078500000,
    version: "1.0.0",
  };

  /**
   * Tertiary baseline window identity
   * Type: BASELINE, Role: CONTROL
   * Created: 2026-04-05T10:30:00Z (Unix ms: 1744079400000)
   * Identifier assigned: 2026-03-10T00:00:00Z (Unix ms: 1744156800000)
   */
  static readonly TERTIARY_BASELINE_IDENTITY: CanonicalWindowIdentity = {
    identifier: {
      id: "win-baseline-001",
      generatedAt: 1744156800000,
      source: "provided",
    } as TemporalWindowIdentifier,
    windowType: "BASELINE",
    windowRole: "CONTROL",
    createdAt: 1744079400000,
    version: "1.0.0",
  };

  /**
   * Validate identity structure
   * @param identity - Identity to validate
   * @returns true if identity is structurally valid, false otherwise
   */
  static isValid(identity: CanonicalWindowIdentity): boolean {
    return (
      !!identity &&
      !!identity.identifier &&
      identity.identifier.id.length > 0 &&
      identity.identifier.generatedAt >= 0 &&
      !!identity.identifier.source &&
      identity.windowType.length > 0 &&
      identity.windowRole.length > 0 &&
      identity.createdAt >= 0 &&
      identity.version.length > 0
    );
  }

  /**
   * Get all example identities for batch verification
   * @returns Array of all example identities
   */
  static getAllIdentities(): CanonicalWindowIdentity[] {
    return [
      this.PRIMARY_REFERENCE_IDENTITY,
      this.SECONDARY_COMPARISON_IDENTITY,
      this.TERTIARY_BASELINE_IDENTITY,
    ];
  }
}
