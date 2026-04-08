/**
 * Trend Chain Context
 * Explicit input specification for deterministic trend chain evaluation.
 * Binds multiple explicit trend outputs into ordered trend-chain surface.
 * All inputs caller-provided. No inference, no defaults, no generated values.
 *
 * Requirements:
 * - Explicit trend chain IDs (all caller-provided, not generated)
 * - Explicit ordered members with explicit chain positions
 * - Explicit links between members
 * - Explicit first/last trend identifiers
 * - Strict validation contract
 */

import type { TrendDirection, TrendStrength } from "../contracts/TrendModelContract.ts";

/**
 * TrendChainMember
 * Explicit member in trend chain derived from prior trend runtime outputs.
 * Represents single trend within ordered chain context.
 */
export interface TrendChainMember {
  /** Unique identifier for this chain member (caller-provided) */
  chainMemberId: string;

  /** Source trend identifier (caller-provided) */
  trendId: string;

  /** Source runtime identifier that produced this trend (caller-provided) */
  sourceRuntimeId: string;

  /** Direction from runtime output (reuses TrendDirection) */
  direction: TrendDirection;

  /** Strength from runtime output (reuses TrendStrength) */
  strength: TrendStrength;

  /** Position within chain sequence (caller-provided, 0-based, must be unique) */
  chainPosition: number;

  /** Timestamp when member was bound to chain (caller-provided, Unix milliseconds) */
  memberBoundAt: number;

  /** Optional metadata for member context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainLink
 * Explicit link between two trend chain members.
 * Structural connection without business interpretation.
 */
export interface TrendChainLink {
  /** Unique identifier for this link (caller-provided) */
  linkId: string;

  /** Source trend identifier (must match sourceMemberId's trendId) */
  sourceTrendId: string;

  /** Target trend identifier (must match targetMemberId's trendId) */
  targetTrendId: string;

  /** Source chain member identifier (caller-provided, must exist in members) */
  sourceMemberId: string;

  /** Target chain member identifier (caller-provided, must exist in members) */
  targetMemberId: string;

  /** Type of link relationship (explicit structural type only) */
  linkType: "precedes" | "follows" | "baseline_reference" | "parallel_reference" | "explicit_link";

  /** Timestamp when link was established (caller-provided, Unix milliseconds) */
  linkedAt: number;

  /** Optional metadata for link context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainInputContext
 * Complete explicit input specification for deterministic trend chain evaluation.
 * All fields must be explicitly provided by caller.
 * No inference, no hidden metadata generation, no synthesized defaults.
 * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
 */
export interface TrendChainInputContext {
  /** Unique identifier for this chain runtime execution (caller-provided) */
  chainRuntimeId: string;

  /** Associated chain session identifier (caller-provided) */
  chainSessionId: string;

  /** Timestamp when chain runtime started (caller-provided, Unix milliseconds) */
  chainStartedAt: number;

  /** Timestamp when chain runtime completed (caller-provided, Unix milliseconds) */
  chainCompletedAt: number;

  /** Explicit trend chain identifier (caller-provided) */
  trendChainId: string;

  /** Chain type classification (caller-provided) */
  chainType: "linear" | "branchless_sequence" | "rolling_trend_set" | "explicit_group" | "undefined";

  /** Explicit ordered members of the chain (caller-provided, must be ordered by chainPosition) */
  members: TrendChainMember[];

  /** Explicit links between members (caller-provided) */
  links: TrendChainLink[];

  /** First trend identifier in chain (caller-provided, must match first ordered member) */
  firstTrendId: string;

  /** Last trend identifier in chain (caller-provided, must match last ordered member) */
  lastTrendId: string;

  /** Optional metadata for chain context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainContextValidator
 * Strict validation of chain context structure and mandatory fields.
 * Throws on any validation failure.
 * Does not infer missing fields, does not synthesize defaults.
 */
export class TrendChainContextValidator {
  /**
   * validate
   * Validate explicit chain context structure.
   *
   * @param context - Chain context to validate
   * @returns Validation result with boolean and error messages
   */
  static validate(context: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Type guard: context must be object
    if (!context || typeof context !== "object") {
      errors.push("Context must be an object");
      return { isValid: false, errors };
    }

    const ctx = context as Record<string, unknown>;

    // Validate chainRuntimeId
    if (typeof ctx.chainRuntimeId !== "string" || ctx.chainRuntimeId.length === 0) {
      errors.push("chainRuntimeId must be a non-empty string (caller-provided)");
    }

    // Validate chainSessionId
    if (typeof ctx.chainSessionId !== "string" || ctx.chainSessionId.length === 0) {
      errors.push("chainSessionId must be a non-empty string (caller-provided)");
    }

    // Validate chainStartedAt
    if (typeof ctx.chainStartedAt !== "number" || ctx.chainStartedAt < 0) {
      errors.push("chainStartedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate chainCompletedAt
    if (typeof ctx.chainCompletedAt !== "number" || ctx.chainCompletedAt < 0) {
      errors.push("chainCompletedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate trendChainId
    if (typeof ctx.trendChainId !== "string" || ctx.trendChainId.length === 0) {
      errors.push("trendChainId must be a non-empty string (caller-provided)");
    }

    // Validate chainType
    const validChainTypes = ["linear", "branchless_sequence", "rolling_trend_set", "explicit_group", "undefined"];
    if (!validChainTypes.includes(ctx.chainType as string)) {
      errors.push(`chainType must be one of: ${validChainTypes.join(", ")}`);
    }

    // Validate members array
    if (!Array.isArray(ctx.members)) {
      errors.push("members must be an array");
    } else {
      if (ctx.members.length === 0) {
        errors.push("members array must not be empty");
      } else {
        const positions = new Set<number>();
        for (let i = 0; i < ctx.members.length; i++) {
          const m = ctx.members[i] as Record<string, unknown>;
          if (!m.chainMemberId || typeof m.chainMemberId !== "string") {
            errors.push(`members[${i}].chainMemberId must be a non-empty string`);
          }
          if (!m.trendId || typeof m.trendId !== "string") {
            errors.push(`members[${i}].trendId must be a non-empty string`);
          }
          if (typeof m.chainPosition !== "number" || m.chainPosition < 0) {
            errors.push(`members[${i}].chainPosition must be a non-negative number`);
          } else {
            if (positions.has(m.chainPosition as number)) {
              errors.push(`members[${i}].chainPosition value ${m.chainPosition} is duplicated`);
            }
            positions.add(m.chainPosition as number);
          }
          if (typeof m.memberBoundAt !== "number" || m.memberBoundAt < 0) {
            errors.push(`members[${i}].memberBoundAt must be a non-negative number`);
          }
        }
      }
    }

    // Validate links array
    if (!Array.isArray(ctx.links)) {
      errors.push("links must be an array");
    } else {
      for (let i = 0; i < ctx.links.length; i++) {
        const l = ctx.links[i] as Record<string, unknown>;
        if (!l.linkId || typeof l.linkId !== "string") {
          errors.push(`links[${i}].linkId must be a non-empty string`);
        }
        const validLinkTypes = ["precedes", "follows", "baseline_reference", "parallel_reference", "explicit_link"];
        if (!validLinkTypes.includes(l.linkType as string)) {
          errors.push(`links[${i}].linkType must be one of: ${validLinkTypes.join(", ")}`);
        }
        if (typeof l.linkedAt !== "number" || l.linkedAt < 0) {
          errors.push(`links[${i}].linkedAt must be a non-negative number`);
        }
      }
    }

    // Validate firstTrendId
    if (typeof ctx.firstTrendId !== "string" || ctx.firstTrendId.length === 0) {
      errors.push("firstTrendId must be a non-empty string (caller-provided)");
    }

    // Validate lastTrendId
    if (typeof ctx.lastTrendId !== "string" || ctx.lastTrendId.length === 0) {
      errors.push("lastTrendId must be a non-empty string (caller-provided)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * validateStrict
   * Validate context and throw if any validation errors found.
   *
   * @param context - Chain context to validate
   * @throws Error if validation fails
   */
  static validateStrict(context: unknown): asserts context is TrendChainInputContext {
    const validation = this.validate(context);
    if (!validation.isValid) {
      throw new Error(`TrendChainContextValidator.validateStrict: Invalid context\n${validation.errors.join("\n")}`);
    }
  }
}
