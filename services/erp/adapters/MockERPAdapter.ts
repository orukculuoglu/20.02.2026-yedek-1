

import { ERPDocument } from "../erpPayloadMapper";
// Fix: Use consistent lowercase casing for erpConnector to resolve casing conflict
import { ERPConnector } from "../erpConnector";

export class MockERPAdapter implements ERPConnector {
  /**
   * Mock implementation of the ERP transmission.
   * Signature updated to match unified ERPConnector interface.
   */
  async sendToERP(doc: ERPDocument): Promise<void> {
    // Artificial latency 300-900ms
    const latency = 300 + Math.random() * 600;
    await new Promise(resolve => setTimeout(resolve, latency));

    // 10% chance of transient error
    if (Math.random() < 0.1) {
      throw new Error("ERP_TEMP_ERROR: Connection timed out or resource busy.");
    }

    console.info(`[ERP_MOCK] Document ${doc.op} for ${doc.externalRef} successfully synced.`);
  }
}