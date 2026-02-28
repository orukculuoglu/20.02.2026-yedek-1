/**
 * Auto Expert Audit Log Store - LocalStorage-backed
 * Tracks all actions on inspection reports for compliance
 */

import type { ExpertAuditLog, AuditAction } from './types';

const AUDIT_KEY = 'lent:auto-expert:audit:v1';

class AuditStore {
  /**
   * Load all audit logs
   */
  loadAll(): ExpertAuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_KEY);
      return data ? (JSON.parse(data) as ExpertAuditLog[]) : [];
    } catch (err) {
      console.error(`[AuditStore] Error loading audit logs:`, err);
      return [];
    }
  }

  /**
   * Save audit logs
   */
  private saveAll(logs: ExpertAuditLog[]): void {
    try {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(logs));
    } catch (err) {
      console.error(`[AuditStore] Error saving audit logs:`, err);
    }
  }

  /**
   * Append new audit log entry
   */
  append(log: Omit<ExpertAuditLog, 'id' | 'at'>): ExpertAuditLog {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const at = new Date().toISOString();

    const fullLog: ExpertAuditLog = {
      id,
      at,
      ...log,
    };

    const all = this.loadAll();
    all.push(fullLog);
    this.saveAll(all);

    return fullLog;
  }

  /**
   * Get all audit logs for a specific report
   */
  byReport(reportId: string): ExpertAuditLog[] {
    return this.loadAll().filter(log => log.reportId === reportId);
  }

  /**
   * Clear all audit logs (for testing)
   */
  clear(): void {
    localStorage.removeItem(AUDIT_KEY);
  }
}

export const auditStore = new AuditStore();
