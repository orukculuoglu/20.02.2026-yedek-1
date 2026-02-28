/**
 * Auto Expert Report Store - LocalStorage-backed
 * Handles CRUD operations for inspection reports
 */

import type { ExpertReport, CreateReportPayload } from './types';
import { createDefaultChecklist, SEED_REPORTS } from './seed';

const STORE_KEY = 'lent:auto-expert:reports:v1';

class ReportStore {
  /**
   * Load all reports from localStorage
   */
  loadAll(): ExpertReport[] {
    try {
      const data = localStorage.getItem(STORE_KEY);
      if (!data) {
        // First time: seed with default reports
        const reports = JSON.parse(JSON.stringify(SEED_REPORTS));
        this.saveAll(reports);
        return reports;
      }
      return JSON.parse(data) as ExpertReport[];
    } catch (err) {
      console.error(`[ReportStore] Error loading reports:`, err);
      return [];
    }
  }

  /**
   * Save all reports to localStorage
   */
  saveAll(reports: ExpertReport[]): void {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(reports));
    } catch (err) {
      console.error(`[ReportStore] Error saving reports:`, err);
    }
  }

  /**
   * Get single report by ID
   */
  getById(id: string): ExpertReport | null {
    const all = this.loadAll();
    return all.find(r => r.id === id) || null;
  }

  /**
   * Create new report with auto-generated ID and createdAt
   */
  create(payload: CreateReportPayload): ExpertReport {
    const id = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const report: ExpertReport = {
      id,
      vehicleId: payload.vehicleId,
      vin: payload.vin,
      plate: payload.plate,
      status: 'Draft',
      checklist: createDefaultChecklist(),
      score: 100,
      riskFlags: [],
      createdBy: payload.createdBy,
      createdAt,
    };

    const all = this.loadAll();
    all.push(report);
    this.saveAll(all);

    return report;
  }

  /**
   * Insert or update single report (upsert)
   */
  upsert(report: ExpertReport): ExpertReport {
    const all = this.loadAll();
    const idx = all.findIndex(r => r.id === report.id);

    if (idx >= 0) {
      all[idx] = report;
    } else {
      all.push(report);
    }

    this.saveAll(all);
    return report;
  }

  /**
   * Delete report (optional, but useful)
   */
  delete(id: string): boolean {
    const all = this.loadAll();
    const idx = all.findIndex(r => r.id === id);

    if (idx >= 0) {
      all.splice(idx, 1);
      this.saveAll(all);
      return true;
    }

    return false;
  }
}

export const reportStore = new ReportStore();
