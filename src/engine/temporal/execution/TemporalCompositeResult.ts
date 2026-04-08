/**
 * Temporal Composite Result
 * Explicit output contracts for deterministic temporal composite surface binding.
 * All results represent computed outputs from explicit caller-provided inputs only.
 * No business logic, no interpretation, no policy.
 */

import type { TemporalCompositeMemberRef } from "./TemporalCompositeContext.ts";

/**
 * TemporalCompositeSurface
 * Complete structural representation of temporal composite surface.
 * Binds multiple temporal result references into single composite entity.
 * No business interpretation, purely structural binding.
 */
export interface TemporalCompositeSurface {
  /** Unique identifier for this composite surface (caller-provided) */
  temporalCompositeId: string;

  /** Composite type classification (caller-provided) */
  compositeType:
    | "runtime_patterns_bridge"
    | "runtime_chain_bridge"
    | "full_temporal_surface"
    | "explicit_temporal_group"
    | "undefined";

  /** Composite members (one per included result reference) */
  members: TemporalCompositeMemberRef[];

  /** Total member count in composite */
  memberCount: number;

  /** Source layers included in this composite (derived from members) */
  includedLayers: Array<"runtime" | "patterns" | "analytics" | "evaluation">;

  /** Timestamp when composite surface was created (caller-provided, Unix milliseconds) */
  evaluatedAt: number;

  /** Optional metadata for surface context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TemporalCompositeResult
 * Complete explicit output of deterministic temporal composite surface binding.
 * Contains composite surface and readiness status.
 * All results strictly derived from explicit caller-provided inputs.
 * No business logic, no interpretation, no policy.
 */
export interface TemporalCompositeResult {
  /** Unique identifier for this composite runtime execution */
  compositeRuntimeId: string;

  /** Associated composite session identifier */
  compositeSessionId: string;

  /** Timestamp when composite runtime started */
  compositeStartedAt: number;

  /** Timestamp when composite runtime completed */
  compositeCompletedAt: number;

  /** Temporal composite surface with members and metadata */
  temporalCompositeSurface: TemporalCompositeSurface;

  /** Overall readiness indicator: true if composite meets all structural requirements */
  isReady: boolean;

  /** Array of readiness errors if isReady is false (absent if isReady is true) */
  readinessErrors: string[];

  /** Optional metadata for result context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TemporalCompositeResultBuilder
 * Deterministic construction of temporal composite results.
 * Assembles explicit computation outputs without interpretation.
 */
export class TemporalCompositeResultBuilder {
  /**
   * build
   * Construct a complete temporal composite result from explicit components.
   * Accepts runtime-collected readiness errors to preserve structural violations.
   *
   * @param compositeRuntimeId - Unique composite runtime execution identifier
   * @param compositeSessionId - Associated composite session identifier
   * @param compositeStartedAt - Timestamp when composite runtime started
   * @param compositeCompletedAt - Timestamp when composite runtime completed
   * @param temporalCompositeSurface - Computed temporal composite surface
   * @param runtimeReadinessErrors - Errors collected during composite binding (preserved, not recomputed)
   * @param metadata - Optional context metadata
   * @returns Complete temporal composite result
   */
  static build(
    compositeRuntimeId: string,
    compositeSessionId: string,
    compositeStartedAt: number,
    compositeCompletedAt: number,
    temporalCompositeSurface: TemporalCompositeSurface,
    runtimeReadinessErrors: string[],
    metadata?: Record<string, unknown>
  ): TemporalCompositeResult {
    // Validate required fields
    if (!compositeRuntimeId || typeof compositeRuntimeId !== "string") {
      throw new Error("TemporalCompositeResultBuilder.build: compositeRuntimeId must be a non-empty string");
    }
    if (!compositeSessionId || typeof compositeSessionId !== "string") {
      throw new Error("TemporalCompositeResultBuilder.build: compositeSessionId must be a non-empty string");
    }
    if (typeof compositeStartedAt !== "number" || compositeStartedAt < 0) {
      throw new Error("TemporalCompositeResultBuilder.build: compositeStartedAt must be a non-negative number");
    }
    if (typeof compositeCompletedAt !== "number" || compositeCompletedAt < 0) {
      throw new Error("TemporalCompositeResultBuilder.build: compositeCompletedAt must be a non-negative number");
    }
    if (!temporalCompositeSurface || typeof temporalCompositeSurface !== "object") {
      throw new Error("TemporalCompositeResultBuilder.build: temporalCompositeSurface must be an object");
    }
    if (!Array.isArray(runtimeReadinessErrors)) {
      throw new Error("TemporalCompositeResultBuilder.build: runtimeReadinessErrors must be an array");
    }

    // Preserve all runtime-collected readiness errors without recomputation
    // Runtime errors take precedence and are never overwritten
    const readinessErrors = [...runtimeReadinessErrors];

    // isReady becomes false if ANY errors were collected during composite binding
    const isReady = readinessErrors.length === 0;

    return {
      compositeRuntimeId,
      compositeSessionId,
      compositeStartedAt,
      compositeCompletedAt,
      temporalCompositeSurface,
      isReady,
      readinessErrors,
      metadata: metadata ? { ...metadata } : undefined,
    };
  }
}
