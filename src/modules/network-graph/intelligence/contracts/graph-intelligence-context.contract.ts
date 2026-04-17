/**
 * Graph Intelligence Context Contract
 * Defines the explicit structural context surface for graph intelligence input.
 * Carries caller-provided request identification only.
 * No policy, no behavioral parameters, no generic metadata bags, pure structural context.
 */

/**
 * GraphIntelligenceContext
 * Minimal structural contract for intelligence request identification.
 * Carries only caller-provided request identifier for tracking and correlation.
 * Strictly bounded, no open-ended payloads, no hidden behavioral semantics.
 */
export interface GraphIntelligenceContext {
  /** Caller-provided identifier for this intelligence request (for tracking and correlation) */
  readonly requestId?: string;
}
