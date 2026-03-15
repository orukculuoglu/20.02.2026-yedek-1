/**
 * Types of action recommendations.
 * Represents different categories of operational recommendations.
 */
export enum ActionRecommendationType {
  INSPECT = 'INSPECT',
  DIAGNOSE = 'DIAGNOSE',
  MONITOR = 'MONITOR',
  SCHEDULE_MAINTENANCE = 'SCHEDULE_MAINTENANCE',
  REPAIR = 'REPAIR',
  REPLACE = 'REPLACE',
  ESCALATE = 'ESCALATE',
  REVIEW = 'REVIEW',
}

/**
 * Types of actors responsible for executing recommendations.
 * Represents different operational teams and systems.
 */
export enum ActionActorType {
  SERVICE = 'SERVICE',
  FLEET = 'FLEET',
  INSPECTION = 'INSPECTION',
  INSURANCE = 'INSURANCE',
  SYSTEM = 'SYSTEM',
  EXPERT = 'EXPERT',
}

/**
 * Execution modes for recommendations.
 * Represents how a recommendation should be executed.
 */
export enum ActionExecutionMode {
  MANUAL = 'MANUAL',
  ASSISTED = 'ASSISTED',
  AUTOMATED = 'AUTOMATED',
}

/**
 * Types of rationale for recommendations.
 * Represents the reason a recommendation was triggered.
 */
export enum ActionRationaleType {
  THRESHOLD_BREACH = 'THRESHOLD_BREACH',
  RISK_ESCALATION = 'RISK_ESCALATION',
  MAINTENANCE_WINDOW = 'MAINTENANCE_WINDOW',
  ANOMALY_DETECTED = 'ANOMALY_DETECTED',
  POLICY_TRIGGER = 'POLICY_TRIGGER',
  EXPERT_REQUIRED = 'EXPERT_REQUIRED',
  SAFETY_CRITICAL = 'SAFETY_CRITICAL',
}
