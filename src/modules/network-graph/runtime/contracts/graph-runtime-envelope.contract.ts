/**
 * Graph Runtime Envelope Entity
 * Structural carrier for a complete runtime-ready graph envelope.
 * Carries the assembly result, structural integrity result, and envelope status together.
 * No orchestration, no workflow behavior, pure structural carrier.
 */

import type { GraphAssemblyResult } from "./graph-assembly-result.contract.ts";
import type { GraphStructuralIntegrityResult } from "./graph-structural-integrity-result.contract.ts";
import type { GraphRuntimeEnvelopeStatus } from "./graph-runtime-envelope-status.contract.ts";

/**
 * GraphRuntimeEnvelope
 * Minimal structural carrier for a runtime-ready graph envelope.
 * Composes assembly result, integrity result, and envelope status into a single carrier.
 * Designed to carry already-completed assembly and integrity evaluation results.
 * No orchestration logic, no decision making, no runtime behavior.
 * All content is caller-provided from prior assembly and integrity evaluation operations.
 */
export interface GraphRuntimeEnvelope {
  /** Graph assembly operation result (caller-provided from assembly operation, required) */
  readonly assemblyResult: GraphAssemblyResult;

  /** Structural integrity evaluation result (caller-provided from integrity evaluation, required) */
  readonly integrityResult: GraphStructuralIntegrityResult;

  /** Envelope structural readiness status (caller-provided, required) */
  readonly status: GraphRuntimeEnvelopeStatus;
}
