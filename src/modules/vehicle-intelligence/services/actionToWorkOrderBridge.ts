/**
 * Action to Work Order Bridge Model
 * Phase 11.5: Lightweight transformation layer mapping vehicle intelligence actions
 * into work-order-ready payloads
 *
 * Design:
 * - PURE: No snapshot writes, no side effects
 * - DETERMINISTIC: Fixed mappings from action types to work order categories
 * - NON-CREATIONAL: Payloads ready for work order creation, but creates nothing
 * - NON-INTEGRATIVE: No external system calls, no ERP integration
 *
 * Mapping Rules:
 * - SCHEDULE_MAINTENANCE → maintenance/preventive-service
 * - PRIORITIZE_SERVICE_APPOINTMENT → maintenance/overdue-service
 * - INSPECT_MECHANICAL_SYSTEM → diagnostics/mechanical-inspection
 * - REVIEW_INSURANCE_POLICY → insurance/policy-review
 * - IMPROVE_DATA_QUALITY → admin/data-completion
 *
 * Data Flow:
 * UI → snapshot getVehicleIntelligenceActions() → this bridge → work order creation (future)
 */

import type { VehicleAction } from '../../data-engine/actions/actionEngine';

/**
 * Work order categories
 */
export type WorkOrderCategory =
  | 'maintenance'
  | 'diagnostics'
  | 'insurance'
  | 'admin';

/**
 * Work order operations
 */
export type WorkOrderOperation =
  | 'preventive-service'
  | 'overdue-service'
  | 'mechanical-inspection'
  | 'policy-review'
  | 'data-completion';

/**
 * Bridge payload: Lightweight work-order-ready structure
 * Ready for async work order creation without modifying this module
 *
 * Fields:
 * - vehicleId: Reference to vehicle
 * - actionKey: Original action identifier
 * - actionType: Type of action (for audit trail)
 * - title: English title of work task
 * - summary: English description of work
 * - priority: Work priority level
 * - suggestedCategory: Recommended work order category
 * - suggestedOperation: Recommended operation type
 * - sourceRecommendationKey: Optional link back to recommendation
 * - group: Original recommendation group for context
 */
export interface VehicleActionWorkOrderBridgePayload {
  vehicleId: string;
  actionKey: string;
  actionType: string;
  title: string;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  suggestedCategory?: WorkOrderCategory;
  suggestedOperation?: WorkOrderOperation;
  sourceRecommendationKey?: string;
  group?: 'maintenance' | 'risk' | 'insurance' | 'data-quality';
}

/**
 * Map single action to work order payload
 * Pure function: no side effects, deterministic output
 *
 * @param vehicleId - Vehicle identifier
 * @param action - Action to map
 * @returns Bridge payload or null if action invalid
 */
export function mapActionToWorkOrderPayload(
  vehicleId: string,
  action: VehicleAction
): VehicleActionWorkOrderBridgePayload | null {
  // Validate input
  if (!vehicleId || !action?.actionType) {
    return null;
  }

  // Determine category and operation based on action type
  let suggestedCategory: WorkOrderCategory | undefined;
  let suggestedOperation: WorkOrderOperation | undefined;

  switch (action.actionType) {
    case 'SCHEDULE_MAINTENANCE':
      suggestedCategory = 'maintenance';
      suggestedOperation = 'preventive-service';
      break;

    case 'PRIORITIZE_SERVICE_APPOINTMENT':
      suggestedCategory = 'maintenance';
      suggestedOperation = 'overdue-service';
      break;

    case 'INSPECT_MECHANICAL_SYSTEM':
      suggestedCategory = 'diagnostics';
      suggestedOperation = 'mechanical-inspection';
      break;

    case 'REVIEW_INSURANCE_POLICY':
      suggestedCategory = 'insurance';
      suggestedOperation = 'policy-review';
      break;

    case 'IMPROVE_DATA_QUALITY':
      suggestedCategory = 'admin';
      suggestedOperation = 'data-completion';
      break;

    default:
      // Unknown action type: return null (unmapped)
      return null;
  }

  // Build payload
  const payload: VehicleActionWorkOrderBridgePayload = {
    vehicleId,
    actionKey: action.key,
    actionType: action.actionType,
    title: action.title || `Work Order for ${action.actionType}`,
    summary: action.summary || `Execute action: ${action.actionType}`,
    priority: action.priority || 'medium',
    suggestedCategory,
    suggestedOperation,
    sourceRecommendationKey: action.sourceRecommendationKey,
    group: action.group,
  };

  return payload;
}

/**
 * Batch map multiple actions to work order payloads
 * Pure helper function for convenience
 *
 * @param vehicleId - Vehicle identifier
 * @param actions - Array of actions to map
 * @returns Array of bridge payloads (invalid actions filtered out)
 */
export function mapActionsToWorkOrderPayloads(
  vehicleId: string,
  actions: VehicleAction[]
): VehicleActionWorkOrderBridgePayload[] {
  if (!Array.isArray(actions)) {
    return [];
  }

  return actions
    .map((action) => mapActionToWorkOrderPayload(vehicleId, action))
    .filter((payload): payload is VehicleActionWorkOrderBridgePayload => payload !== null);
}

/**
 * MAPPING REFERENCE
 *
 * Action Type → Work Order Category / Operation
 * ══════════════════════════════════════════════════════════════════
 *
 * SCHEDULE_MAINTENANCE
 *   Category: maintenance
 *   Operation: preventive-service
 *   Purpose: Schedule routine service based on maintenance discipline low
 *   Timeline: Within 30 days
 *
 * PRIORITIZE_SERVICE_APPOINTMENT
 *   Category: maintenance
 *   Operation: overdue-service
 *   Purpose: Schedule overdue service for vehicle
 *   Timeline: Within 14 days
 *
 * INSPECT_MECHANICAL_SYSTEM
 *   Category: diagnostics
 *   Operation: mechanical-inspection
 *   Purpose: Inspection of mechanical systems flagged for risk
 *   Timeline: Within 7 days (if high priority)
 *
 * REVIEW_INSURANCE_POLICY
 *   Category: insurance
 *   Operation: policy-review
 *   Purpose: Insurance claim review or policy adjustment
 *   Timeline: Within 5 business days
 *
 * IMPROVE_DATA_QUALITY
 *   Category: admin
 *   Operation: data-completion
 *   Purpose: Complete missing data fields or verify accuracy
 *   Timeline: Within 2 business days
 *
 * ══════════════════════════════════════════════════════════════════
 * NOTES:
 * - All mappings are deterministic and immutable
 * - No external system calls
 * - Payloads are work-order-ready but not submitted
 * - Priority preserved from action
 * - Source recommendation linked for audit trail
 * - Group context retained for categorization
 */
