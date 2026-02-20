

// Fix: Use consistent lowercase casing for erpOutbox to resolve casing conflict
import { OutboxEvent } from "./erpOutbox";
import { ServiceWorkOrder } from "../../types";

export type ERPOp = 'CREATE_OR_UPDATE_WORKORDER' | 'APPEND_LINE_ITEMS' | 'SET_STATUS' | 'REGISTER_APPROVAL';

export interface ERPDocument {
  op: ERPOp;
  tenantId: string;
  externalRef: string;
  timestamp: string;
  data: {
    status?: string;
    approval?: { hasApproval: boolean; approvalLinkId?: string };
    lineItems?: Array<{ kind: 'PART' | 'LABOR'; code?: string; name: string; qty: number; unit?: string }>;
    notes?: string[];
    totals?: { estimateIndex?: number };
  };
  meta: {
    source: 'LENT+';
    schemaVersion: '1.0';
    kvkk: 'NO_PII';
    correlation: { operationalHash?: string };
  };
}

/**
 * mapOutboxEventToERPDocument
 * Transforms a LENT+ outbox event into a sanitized ERP document.
 * Strictly enforces NO_PII policy.
 */
export const mapOutboxEventToERPDocument = (args: {
  event: OutboxEvent;
  workOrder?: ServiceWorkOrder;
}): ERPDocument => {
  const { event, workOrder } = args;

  let op: ERPOp = 'CREATE_OR_UPDATE_WORKORDER';
  const data: ERPDocument['data'] = {};

  switch (event.type) {
    case 'WORK_ORDER_STATUS_CHANGED':
      op = 'SET_STATUS';
      data.status = event.payload.toStatus;
      break;

    case 'WORK_ORDER_PARTS_CHANGED':
      op = 'APPEND_LINE_ITEMS';
      if (event.payload.diagnosisItems && Array.isArray(event.payload.diagnosisItems)) {
        data.lineItems = event.payload.diagnosisItems.map((item: any) => ({
          kind: item.type === 'PART' ? 'PART' : 'LABOR',
          name: item.item, // Name is safe operational data
          qty: 1, // Default quantity
          // Only include code if it doesn't look like an OEM VIN-derived identifier
          code: item.recommendedPartRef && !item.recommendedPartRef.includes('VIN') ? 'INTERNAL' : undefined
        }));
        
        // Calculate a safe totals index (relative scale, no currency symbols)
        const total = event.payload.diagnosisItems.reduce((acc: number, i: any) => acc + (i.signalCost || 0), 0);
        data.totals = { estimateIndex: total };
      }
      break;

    case 'WORK_ORDER_APPROVAL_LINK_CREATED':
      op = 'REGISTER_APPROVAL';
      data.approval = { 
        hasApproval: false, 
        // Extract only a token from the link to avoid full URL leaking context
        approvalLinkId: event.payload.link ? event.payload.link.split('/').pop()?.split('?')[0] : 'TOKEN_PENDING'
      };
      break;
  }

  return {
    op,
    tenantId: event.tenantId,
    externalRef: event.workOrderId,
    timestamp: new Date().toISOString(),
    data,
    meta: {
      source: 'LENT+',
      schemaVersion: '1.0',
      kvkk: 'NO_PII',
      correlation: {
        operationalHash: workOrder?.operationalHash
      }
    }
  };
};