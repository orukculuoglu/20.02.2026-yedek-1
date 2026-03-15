/**
 * Dispatch lifecycle status enum.
 * Represents the operational state of a dispatch.
 */
export enum DispatchStatus {
  CREATED = 'CREATED',
  READY = 'READY',
  DISPATCHING = 'DISPATCHING',
  SENT = 'SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Dispatch priority enum.
 * Determines urgency of dispatch execution.
 */
export enum DispatchPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Dispatch actor type enum.
 * Identifies the target system or service for dispatch delivery.
 */
export enum DispatchActorType {
  SERVICE = 'SERVICE',
  FLEET = 'FLEET',
  INSPECTION = 'INSPECTION',
  INSURANCE = 'INSURANCE',
  ERP = 'ERP',
  SYSTEM = 'SYSTEM',
}

/**
 * Dispatch channel type enum.
 * Specifies the communication channel for dispatch delivery.
 */
export enum DispatchChannelType {
  ERP_PUSH = 'ERP_PUSH',
  API = 'API',
  WEBHOOK = 'WEBHOOK',
  INTERNAL_QUEUE = 'INTERNAL_QUEUE',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

/**
 * Dispatch result type enum.
 * Categorizes the outcome of a dispatch attempt.
 */
export enum DispatchResultType {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  RETRYABLE_FAILURE = 'RETRYABLE_FAILURE',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}
