/**
 * Fleet Routing Orchestration Module
 * 
 * Pure deterministic orchestration that converts Fleet Connector intake
 * evaluation results into internal Fleet Service Routing Requests by
 * orchestrating the routing bridge across all service routing candidates.
 * 
 * Exports:
 * - FleetRoutingOrchestratorRuntimeInput: Input structure for the orchestrator
 * - FleetRoutingOrchestratorStatus: Outcome status enumeration
 * - FleetRoutingOrchestratorResult: Result structure
 * - orchestrateFleetConnectorRouting: Orchestration transformation function
 */

export type {
  FleetRoutingOrchestratorRuntimeInput,
} from './fleet-routing-orchestrator.input';

export {
  FleetRoutingOrchestratorStatus,
} from './fleet-routing-orchestrator.result';

export type {
  FleetRoutingOrchestratorResult,
} from './fleet-routing-orchestrator.result';

export {
  orchestrateFleetConnectorRouting,
} from './fleet-routing-orchestrator';
