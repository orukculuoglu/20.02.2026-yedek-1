import { ServiceWorkOrder } from '../types';

export type StatusBucket = 'INTAKE' | 'DIAGNOSIS' | 'APPROVAL' | 'IN_PROGRESS' | 'DELIVERY';

export interface OperationalMetrics {
  total: number;
  delivered: number;
  readyForDelivery: number;
  approvalWaiting: number;
  erpPending: number;
  buckets: Record<StatusBucket, number>;
  topApprovalBottlenecks: Array<{
    id: string;
    status: string;
    createdAt: string;
    itemCount: number;
    salesTotal: number;
  }>;
}

const APPROVAL_STATUSES = new Set([
  'OFFER_DRAFT',
  'WAITING_APPROVAL',
  'CUSTOMER_APPROVAL',
  'CUSTOMER_CONFIRM',
  'CUSTOMER_WAITING',
  'WAITING_CUSTOMER_APPROVAL'
]);

const BUCKET = (status: string): StatusBucket => {
  if (status === 'INTAKE_PENDING') return 'INTAKE';
  if (status === 'DIAGNOSIS') return 'DIAGNOSIS';
  if (APPROVAL_STATUSES.has(status)) return 'APPROVAL';
  if (status === 'APPROVED' || status === 'IN_PROGRESS') return 'IN_PROGRESS';
  return 'DELIVERY'; // READY_FOR_DELIVERY / DELIVERED vb.
};

/**
 * computeOperationalMetrics
 * Verilen iş emirleri listesi üzerinden V1 operasyonel metriklerini hesaplar.
 */
export const computeOperationalMetrics = (workOrders: ServiceWorkOrder[]): OperationalMetrics => {
  const total = workOrders.length;

  const delivered = workOrders.filter(w => w.status === 'DELIVERED').length;
  const readyForDelivery = workOrders.filter(w => w.status === 'READY_FOR_DELIVERY').length;

  const approvalWaitingOrders = workOrders.filter(w => APPROVAL_STATUSES.has(w.status));
  const approvalWaiting = approvalWaitingOrders.length;

  const erpPending = workOrders.filter(w => w.erpState === 'PENDING').length;

  const buckets: Record<StatusBucket, number> = {
    INTAKE: 0,
    DIAGNOSIS: 0,
    APPROVAL: 0,
    IN_PROGRESS: 0,
    DELIVERY: 0
  };

  for (const w of workOrders) {
    buckets[BUCKET(w.status)]++;
  }

  const topApprovalBottlenecks = [...approvalWaitingOrders]
    .sort((a, b) => (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0))
    .slice(0, 5)
    .map(w => ({
      id: w.id,
      status: w.status,
      createdAt: w.createdAt,
      itemCount: w.diagnosisItems?.length || 0,
      salesTotal: (w.diagnosisItems || []).reduce((acc, it) => acc + (it.signalCost || 0), 0),
    }));

  return {
    total,
    delivered,
    readyForDelivery,
    approvalWaiting,
    erpPending,
    buckets,
    topApprovalBottlenecks
  };
};
