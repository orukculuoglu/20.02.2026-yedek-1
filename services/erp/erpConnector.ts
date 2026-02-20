

import { ERPDocument } from "./erpPayloadMapper";

const LOG_STORAGE_KEY = "LENT_ERP_SENT_LOG_V1";

/**
 * Unified ERPConnector interface definition.
 * Casing standardized to lowercase for the file to match compilation roots.
 */
export interface ERPConnector {
  sendToERP(doc: ERPDocument): Promise<void>;
}

/**
 * sendToERP
 * Receives a mapped document and simulates transmission to the enterprise ERP endpoint.
 */
export async function sendToERP(doc: ERPDocument): Promise<void> {
  // 1. Artificial latency simulation
  const latency = 300 + Math.random() * 600;
  await new Promise(resolve => setTimeout(resolve, latency));

  // 2. Chance of transient error simulation
  if (Math.random() < 0.1) {
    throw new Error("ERP_TEMP_ERROR: Connection timed out or endpoint busy.");
  }

  // 3. Log success to persistent bridge stream
  appendToSentLog(doc);

  console.info(`[ERP_BRIDGE] Document successfully transmitted: ${logFormattedOp(doc.op)} for ${doc.externalRef}`);
}

function logFormattedOp(op: string): string {
  return op;
}

function appendToSentLog(doc: ERPDocument) {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    const logs: ERPDocument[] = raw ? JSON.parse(raw) : [];
    logs.unshift(doc);
    const capped = logs.slice(0, 50);
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(capped));
    window.dispatchEvent(new Event('ERP_BRIDGE_LOG_UPDATED'));
  } catch (e) {
    console.error("Failed to update ERP bridge log", e);
  }
}

export const getErpSentLog = (): ERPDocument[] => {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
