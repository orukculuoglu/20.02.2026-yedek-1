/**
 * Work Order Event Contract for Data Engine
 * 
 * Defines the event structure for work order lifecycle events produced by Maintenance Center.
 * This is a contract-only definition with no runtime transmission or listeners.
 * 
 * Ownership:
 * - Producer: MAINTENANCE_CENTER
 * - Future Consumers: FLEET_RENTAL, RISK_ANALYSIS, SPARE_PARTS, PART_LIFE, API
 * - Status: CONTRACT_ONLY (no runtime transmission in this phase)
 * 
 * PII Safety:
 * - No direct vehicle identifiers or personal contact fields
 * - Vehicle identified by vehicleId only (AVID-safe)
 * - No pricing unless already non-PII and present in work order domain model
 * - All fields optional where uncertainty exists
 */

/**
 * Work Order event types produced by Maintenance Center
 * 
 * Lifecycle:
 * 1. WORKORDER_CREATED - Work order instantiated
 * 2. WORKORDER_APPROVED - Approval workflow completed
 * 3. WORKORDER_IN_PROGRESS - Work started
 * 4. WORKORDER_CLOSED - Work completed
 * 5. WORKORDER_CANCELLED - Work cancelled or rejected
 */
export type WorkOrderDataEngineEventType =
  | "WORKORDER_CREATED"
  | "WORKORDER_APPROVED"
  | "WORKORDER_IN_PROGRESS"
  | "WORKORDER_CLOSED"
  | "WORKORDER_CANCELLED";

/**
 * Work order event producer
 * Only Maintenance Center owns work order lifecycle events
 */
export type WorkOrderEventOwner = "MAINTENANCE_CENTER";

/**
 * Work order lifecycle status
 * Tracks state transitions of work orders
 */
export type WorkOrderLifecycleStatus =
  | "CREATED"
  | "APPROVED"
  | "IN_PROGRESS"
  | "CLOSED"
  | "CANCELLED";

/**
 * Vehicle reference in work order event
 * PII-safe vehicle reference containing only safe identifiers
 */
export interface WorkOrderEventVehicleRef {
  /**
   * Unique vehicle identifier (AVID format)
   * Safe for cross-domain traceability
   */
  vehicleId: string;

  /**
   * Fleet this vehicle belongs to (optional for context)
   * Enables fleet-level aggregation
   */
  fleetId?: string;

  /**
   * Tenant for multi-tenant scenarios (optional)
   * Can be provided by context or left undefined
   */
  tenantId?: string;
}

/**
 * Work order line item reference
 * Tracks parts, operations, and services related to work order
 * No pricing to avoid cost-related PII in foundation phase
 */
export interface WorkOrderLineItemRef {
  /**
   * Unique line item identifier (optional)
   */
  lineItemId?: string;

  /**
   * Operation code (e.g., "BRAKE_PAD_REPLACE", "OIL_CHANGE")
   * Machine-readable operation identifier
   */
  operationCode?: string;

  /**
   * Operation name in human-readable form
   */
  operationName?: string;

  /**
   * Part identifier if line item is part-related
   * Used for part demand tracking by Spare Parts module
   */
  partId?: string;

  /**
   * Part name if available
   */
  partName?: string;

  /**
   * Quantity of parts/services
   */
  quantity?: number;

  /**
   * Current status of line item (e.g., "PENDING", "IN_PROGRESS", "COMPLETED")
   */
  status?: string;
}

/**
 * Base payload for all work order events
 * Shared fields across all work order event types
 */
export interface WorkOrderEventPayloadBase {
  /**
   * Unique work order identifier
   */
  workOrderId: string;

  /**
   * Related service redirect ID (if created from redirect)
   * Enables traceability from service redirect to work order
   */
  redirectId?: string;

  /**
   * Event producer (always MAINTENANCE_CENTER)
   */
  owner: WorkOrderEventOwner;

  /**
   * Current lifecycle status
   */
  status: WorkOrderLifecycleStatus;

  /**
   * Vehicle this work order is for
   */
  vehicle: WorkOrderEventVehicleRef;

  /**
   * Line items in this work order (readonly for immutability)
   */
  lineItems?: ReadonlyArray<WorkOrderLineItemRef>;

  /**
   * Reason code for state transition (optional)
   * E.g., "ROUTINE_MAINTENANCE", "BREAKDOWN", "POLICY_DRIVEN", "CUSTOMER_REQUEST"
   */
  reasonCode?: string;

  /**
   * Source module (always MAINTENANCE_CENTER)
   */
  sourceModule: "MAINTENANCE_CENTER";

  /**
   * PII safety flag (must be true for all work order events)
   */
  piiSafe: true;
}

/**
 * WORKORDER_CREATED event payload
 * Produced when work order is first created
 */
export interface WorkOrderCreatedEventPayload extends WorkOrderEventPayloadBase {
  status: "CREATED";
}

/**
 * WORKORDER_APPROVED event payload
 * Produced when work order passes approval workflow
 */
export interface WorkOrderApprovedEventPayload extends WorkOrderEventPayloadBase {
  status: "APPROVED";

  /**
   * Approval type (optional context)
   * E.g., "MANAGER_APPROVAL", "COMPLIANCE_APPROVAL", "AUTO_APPROVED"
   */
  approvalType?: string;
}

/**
 * WORKORDER_IN_PROGRESS event payload
 * Produced when work order execution starts
 */
export interface WorkOrderInProgressEventPayload extends WorkOrderEventPayloadBase {
  status: "IN_PROGRESS";

  /**
   * When work started (ISO 8601, optional)
   */
  startedAt?: string;
}

/**
 * WORKORDER_CLOSED event payload
 * Produced when work order is completed
 */
export interface WorkOrderClosedEventPayload extends WorkOrderEventPayloadBase {
  status: "CLOSED";

  /**
   * When work completed (ISO 8601, optional)
   */
  completedAt?: string;

  /**
   * Completion reason (optional)
   * E.g., "SUCCESSFULLY_COMPLETED", "CUSTOMER_ACCEPTED", "PARTIAL_COMPLETION"
   */
  completionReason?: string;
}

/**
 * WORKORDER_CANCELLED event payload
 * Produced when work order is cancelled or rejected
 */
export interface WorkOrderCancelledEventPayload extends WorkOrderEventPayloadBase {
  status: "CANCELLED";

  /**
   * Cancellation reason (optional but recommended)
   * E.g., "CUSTOMER_REQUEST", "SUPPLY_SHORTAGE", "POLICY_VIOLATION", "DUPLICATE_REJECTED"
   */
  cancellationReason?: string;
}

/**
 * Union of all work order event payload types
 * Enables type-safe payload handling
 */
export type WorkOrderDataEngineEventPayload =
  | WorkOrderCreatedEventPayload
  | WorkOrderApprovedEventPayload
  | WorkOrderInProgressEventPayload
  | WorkOrderClosedEventPayload
  | WorkOrderCancelledEventPayload;

/**
 * Type guard: Check if value is a valid work order event type
 * Pure function, no side effects
 */
export function isWorkOrderDataEngineEventType(
  value: unknown
): value is WorkOrderDataEngineEventType {
  if (typeof value !== "string") return false;

  const validTypes: readonly string[] = [
    "WORKORDER_CREATED",
    "WORKORDER_APPROVED",
    "WORKORDER_IN_PROGRESS",
    "WORKORDER_CLOSED",
    "WORKORDER_CANCELLED",
  ];

  return validTypes.includes(value);
}

/**
 * Type guard: Check if value is a valid work order lifecycle status
 * Pure function, no side effects
 */
export function isWorkOrderLifecycleStatus(
  value: unknown
): value is WorkOrderLifecycleStatus {
  if (typeof value !== "string") return false;

  const validStatuses: readonly string[] = [
    "CREATED",
    "APPROVED",
    "IN_PROGRESS",
    "CLOSED",
    "CANCELLED",
  ];

  return validStatuses.includes(value);
}

/**
 * Type guard: Check if value is a valid work order event payload
 * Validates structure and piiSafe flag
 * Pure function, no side effects
 */
export function isWorkOrderEventPayload(
  value: unknown
): value is WorkOrderDataEngineEventPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Record<string, unknown>;

  // Required fields
  if (typeof payload.workOrderId !== "string") return false;
  if (!isWorkOrderEventOwner(payload.owner)) return false;
  if (!isWorkOrderLifecycleStatus(payload.status)) return false;
  if (!isWorkOrderEventVehicleRef(payload.vehicle)) return false;
  if (payload.sourceModule !== "MAINTENANCE_CENTER") return false;
  if (payload.piiSafe !== true) return false;

  // Optional fields (if present, validate type)
  if (payload.redirectId !== undefined && typeof payload.redirectId !== "string") {
    return false;
  }

  if (payload.reasonCode !== undefined && typeof payload.reasonCode !== "string") {
    return false;
  }

  if (payload.lineItems !== undefined && !Array.isArray(payload.lineItems)) {
    return false;
  }

  // Status-specific fields
  if (payload.status === "APPROVED") {
    const approved = payload as Record<string, unknown>;
    if (
      approved.approvalType !== undefined &&
      typeof approved.approvalType !== "string"
    ) {
      return false;
    }
  }

  if (payload.status === "IN_PROGRESS") {
    const inProgress = payload as Record<string, unknown>;
    if (
      inProgress.startedAt !== undefined &&
      typeof inProgress.startedAt !== "string"
    ) {
      return false;
    }
  }

  if (payload.status === "CLOSED") {
    const closed = payload as Record<string, unknown>;
    if (
      closed.completedAt !== undefined &&
      typeof closed.completedAt !== "string"
    ) {
      return false;
    }
    if (
      closed.completionReason !== undefined &&
      typeof closed.completionReason !== "string"
    ) {
      return false;
    }
  }

  if (payload.status === "CANCELLED") {
    const cancelled = payload as Record<string, unknown>;
    if (
      cancelled.cancellationReason !== undefined &&
      typeof cancelled.cancellationReason !== "string"
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Helper: Type guard for WorkOrderEventOwner
 */
function isWorkOrderEventOwner(value: unknown): value is WorkOrderEventOwner {
  return value === "MAINTENANCE_CENTER";
}

/**
 * Helper: Type guard for WorkOrderEventVehicleRef
 */
function isWorkOrderEventVehicleRef(
  value: unknown
): value is WorkOrderEventVehicleRef {
  if (!value || typeof value !== "object") return false;

  const ref = value as Record<string, unknown>;

  if (typeof ref.vehicleId !== "string") return false;

  if (ref.fleetId !== undefined && typeof ref.fleetId !== "string") {
    return false;
  }

  if (ref.tenantId !== undefined && typeof ref.tenantId !== "string") {
    return false;
  }

  return true;
}

/**
 * Work Order Event Ownership Documentation
 * 
 * Defines producer/consumer roles and contract status
 * Used for architecture documentation and phase planning
 */
export const WORK_ORDER_EVENT_OWNERSHIP = {
  /**
   * Producer module (owns work order lifecycle)
   */
  producer: "MAINTENANCE_CENTER" as const,

  /**
   * Consumer modules (may consume work order events in future phases)
   */
  consumers: [
    "FLEET_RENTAL",    // May consume to update vehicle status or readiness
    "RISK_ANALYSIS",   // May consume to factor maintenance into risk scoring
    "SPARE_PARTS",     // May consume to track part demand and supply
    "PART_LIFE",       // May consume to validate predictive part life accuracy
    "API",             // May expose work order data to external integrations
  ] as const,

  /**
   * Contract status (foundation only, no runtime transmission yet)
   */
  contractStatus: "CONTRACT_ONLY" as const,

  /**
   * Runtime transmission enabled
   */
  runtimeEmission: false as const,

  /**
   * Description
   */
  description:
    "Work Order events define the lifecycle of maintenance work orders. " +
    "Maintenance Center is the sole producer. Events are contract-only in Phase 0, " +
    "enabling safe phase planning before runtime transmission in Phase 1.",
} as const;

/**
 * Work Order Event Payload examples for documentation
 * (Not runtime - for reference only)
 */
export const WORK_ORDER_EVENT_EXAMPLES = {
  created: {
    workOrderId: "WO-2026-001",
    owner: "MAINTENANCE_CENTER",
    status: "CREATED",
    vehicle: { vehicleId: "AVID-12345", fleetId: "FLEET-001" },
    lineItems: [
      {
        operationCode: "BRAKE_PAD_REPLACE",
        operationName: "Replace Brake Pads",
        partId: "PART-98765",
        quantity: 4,
      },
    ],
    reasonCode: "ROUTINE_MAINTENANCE",
    sourceModule: "MAINTENANCE_CENTER",
    piiSafe: true,
  } as WorkOrderCreatedEventPayload,

  approved: {
    workOrderId: "WO-2026-001",
    owner: "MAINTENANCE_CENTER",
    status: "APPROVED",
    vehicle: { vehicleId: "AVID-12345", fleetId: "FLEET-001" },
    lineItems: [
      {
        operationCode: "BRAKE_PAD_REPLACE",
        operationName: "Replace Brake Pads",
        partId: "PART-98765",
        quantity: 4,
      },
    ],
    reasonCode: "ROUTINE_MAINTENANCE",
    sourceModule: "MAINTENANCE_CENTER",
    piiSafe: true,
    approvalType: "MANAGER_APPROVAL",
  } as WorkOrderApprovedEventPayload,

  closed: {
    workOrderId: "WO-2026-001",
    owner: "MAINTENANCE_CENTER",
    status: "CLOSED",
    vehicle: { vehicleId: "AVID-12345", fleetId: "FLEET-001" },
    lineItems: [
      {
        operationCode: "BRAKE_PAD_REPLACE",
        operationName: "Replace Brake Pads",
        partId: "PART-98765",
        quantity: 4,
        status: "COMPLETED",
      },
    ],
    reasonCode: "ROUTINE_MAINTENANCE",
    sourceModule: "MAINTENANCE_CENTER",
    piiSafe: true,
    completionReason: "SUCCESSFULLY_COMPLETED",
  } as WorkOrderClosedEventPayload,
} as const;
