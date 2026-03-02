/**
 * Cross-Domain Module
 * Export all public APIs for cross-domain fusion
 */

export {
  buildCrossDomainFindings,
  getFusionSeverity,
} from "./crossDomainFusionEngine";

export { emitCrossDomainFusionSnapshot } from "./crossDomainEventSender";

export type {
  CrossDomainContext,
  CrossDomainFinding,
  CrossDomainFusionResult,
  CrossDomainFusionEventPayload,
} from "./types";
