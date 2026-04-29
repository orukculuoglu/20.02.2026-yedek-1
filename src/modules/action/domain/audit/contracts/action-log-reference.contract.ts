/**
 * ActionLogReference - Minimal reference contract for action audit log records
 * Pure reference structure with no loading, resolution, or retrieval behavior.
 * Identifies a single action log record.
 */
export interface ActionLogReference {
  /**
   * Unique identifier for this action audit log record
   */
  readonly actionLogId: string;
}
