

// Fix: Use consistent lowercase casing for imports to resolve casing conflicts
import { listDue, markSent, markFailed } from "./erpOutbox";
import { sendToERP } from "./erpConnector";
import { mapOutboxEventToERPDocument } from "./erpPayloadMapper";
import { getServiceWorkOrders } from "../dataService";

let isRunning = false;

const computeBackoff = (attempts: number): number => {
  if (attempts === 1) return 10000; // 10s
  if (attempts === 2) return 30000; // 30s
  if (attempts === 3) return 60000; // 60s
  return 120000; // 120s cap
};

/**
 * Global ERP Sync Worker.
 * Casing standardized to lowercase for consistency.
 */
export function startERPWorker(): () => void {
  const tick = async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      const dueEvents = listDue();
      if (dueEvents.length === 0) {
        isRunning = false;
        return;
      }

      dueEvents.sort((a, b) => a.createdAt - b.createdAt);

      const processedWorkOrders = new Set<string>();

      for (const event of dueEvents) {
        if (processedWorkOrders.has(event.workOrderId)) continue;
        processedWorkOrders.add(event.workOrderId);

        try {
          // Fetch work order context for mapping (Safe snapshot, no Vault PII)
          const allWos = await getServiceWorkOrders(event.tenantId);
          const woSnapshot = allWos.find(w => w.id === event.workOrderId);

          // MAP: Event -> ERP Document
          const erpDoc = mapOutboxEventToERPDocument({ event, workOrder: woSnapshot });

          // SEND: Document using standardized connector
          await sendToERP(erpDoc);
          
          markSent(event.id);
        } catch (err: any) {
          const delay = computeBackoff(event.attempts + 1);
          markFailed(event.id, err.message || "Unknown ERP Error", delay);
        }
      }
    } finally {
      isRunning = false;
    }
  };

  // Run every 10 seconds
  const intervalId = setInterval(tick, 10000);
  
  // Initial check
  tick();

  return () => clearInterval(intervalId);
}
