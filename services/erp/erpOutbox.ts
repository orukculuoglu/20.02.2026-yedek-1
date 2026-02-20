

/**
 * ERP Outbox Manager
 * Unified implementation using lowercase filename to match compilation roots.
 */
export type OutboxStatus = 'PENDING' | 'SENT' | 'FAILED';
export type OutboxEventType = 
  | 'WORK_ORDER_STATUS_CHANGED' 
  | 'WORK_ORDER_PARTS_CHANGED' 
  | 'WORK_ORDER_APPROVAL_LINK_CREATED'
  | 'AUTO_STOCK_ORDER';

export interface OutboxEvent {
  id: string;
  tenantId: string;
  workOrderId: string;
  type: OutboxEventType;
  payload: any;
  status: OutboxStatus;
  attempts: number;
  nextRetryAt: number;
  createdAt: number;
  lastError?: string;
  lastAttemptAt?: number;
}

const STORAGE_KEY = "LENT_ERP_OUTBOX_V1";

const getStore = (): OutboxEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Outbox retrieval failed", e);
    return [];
  }
};

const saveStore = (events: OutboxEvent[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event('ERP_OUTBOX_UPDATED'));
};

/**
 * Enqueue a new event to the ERP outbox.
 */
export const enqueueEvent = (input: { 
  tenantId: string; 
  workOrderId: string; 
  type: OutboxEventType; 
  payload: any 
}): OutboxEvent => {
  const events = getStore();
  const newEvent: OutboxEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenantId: input.tenantId,
    workOrderId: input.workOrderId,
    type: input.type,
    payload: input.payload,
    status: 'PENDING',
    attempts: 0,
    nextRetryAt: Date.now(),
    createdAt: Date.now()
  };
  events.push(newEvent);
  saveStore(events);
  return newEvent;
};

export const listDue = (now = Date.now()): OutboxEvent[] => {
  return getStore().filter(e => e.status !== 'SENT' && e.nextRetryAt <= now);
};

export const markSent = (id: string) => {
  const events = getStore();
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) {
    events[idx].status = 'SENT';
    events[idx].lastAttemptAt = Date.now();
    saveStore(events);
  }
};

export const markFailed = (id: string, error: string, delayMs: number) => {
  const events = getStore();
  const idx = events.findIndex(e => e.id === id);
  if (idx !== -1) {
    const event = events[idx];
    event.attempts++;
    event.lastError = error;
    event.status = 'FAILED';
    event.lastAttemptAt = Date.now();
    event.nextRetryAt = Date.now() + delayMs;
    saveStore(events);
  }
};

/**
 * Manually force a retry for a specific work order.
 */
export const retryWorkOrderNow = (tenantId: string, workOrderId: string) => {
  const events = getStore();
  let changed = false;
  events.forEach(e => {
    if (e.tenantId === tenantId && e.workOrderId === workOrderId && e.status !== 'SENT') {
      e.status = 'PENDING';
      e.nextRetryAt = Date.now();
      changed = true;
    }
  });
  if (changed) {
    saveStore(events);
  }
};

export const getWorkOrderSyncState = (tenantId: string, workOrderId: string): { 
  state: 'IDLE' | 'PENDING' | 'FAILED' | 'SENT' | 'OFFLINE', 
  lastError?: string, 
  lastAttemptAt?: number,
  attempts?: number
} => {
  const events = getStore()
    .filter(e => e.tenantId === tenantId && e.workOrderId === workOrderId)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (events.length === 0) return { state: 'IDLE' };
  
  const latest = events[0];
  const isPending = events.some(e => e.status === 'PENDING');
  if (isPending) {
    return { state: 'PENDING', attempts: latest.attempts, lastAttemptAt: latest.lastAttemptAt };
  }

  if (latest.status === 'SENT') {
    return { state: 'SENT', lastAttemptAt: latest.lastAttemptAt, attempts: latest.attempts };
  }
  
  if (latest.status === 'FAILED') {
    const state = latest.attempts >= 3 ? 'OFFLINE' : 'FAILED';
    return { 
      state, 
      lastError: latest.lastError,
      lastAttemptAt: latest.lastAttemptAt,
      attempts: latest.attempts
    };
  }

  return { state: 'IDLE' };
};
