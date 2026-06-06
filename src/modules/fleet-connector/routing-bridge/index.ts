/**
 * Fleet Routing Bridge Module
 * 
 * Pure deterministic bridge that converts Fleet Connector intake service
 * routing candidates into internal Fleet Service Routing Requests.
 * 
 * Exports:
 * - FleetRoutingBridgeRuntimeInput: Input structure for the bridge
 * - FleetRoutingBridgeStatus: Outcome status enumeration
 * - FleetRoutingBridgeRejectReason: Rejection reason enumeration
 * - FleetRoutingBridgeResult: Result structure
 * - promoteFleetIntakeCandidateToRoutingRequest: Bridge transformation function
 */

export type {
  FleetRoutingBridgeRuntimeInput,
} from './fleet-routing-bridge.input';

export {
  FleetRoutingBridgeStatus,
  FleetRoutingBridgeRejectReason,
} from './fleet-routing-bridge.result';

export type {
  FleetRoutingBridgeResult,
} from './fleet-routing-bridge.result';

export {
  promoteFleetIntakeCandidateToRoutingRequest,
} from './fleet-routing-bridge';
