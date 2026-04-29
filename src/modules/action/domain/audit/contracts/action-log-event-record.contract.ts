import type { ActionLogEventKind } from "./action-log-event-kind.enum.js";
import type { ActionLogSource } from "./action-log-source.enum.js";
import type { ActionAuditLinkage } from "./action-audit-linkage.contract.js";
import type { ActionLogActorReference } from "./action-log-actor-reference.contract.js";

/**
 * ActionLogEventRecord - Structural definition of an individual action audit log event
 * Pure structural contract for a single log entry without storage, processing, or replay semantics.
 * Captures event kind, source, linkage, and optional actor reference.
 * No timestamp: timing concerns deferred to audit traceability layer if needed.
 */
export interface ActionLogEventRecord {
  /**
   * Unique identifier for this log event record
   */
  readonly logEventId: string;

  /**
   * Classification of the event that was logged
   */
  readonly eventKind: ActionLogEventKind;

  /**
   * Source of the event that generated this log entry
   */
  readonly eventSource: ActionLogSource;

  /**
   * Linkage references connecting log entry to action flow structures
   * Guaranteed to contain at least one linkage reference at compile time.
   */
  readonly auditLinkage: ActionAuditLinkage;

  /**
   * Optional actor/reference information for audit trail attribution
   */
  readonly actorReference?: ActionLogActorReference;
}
