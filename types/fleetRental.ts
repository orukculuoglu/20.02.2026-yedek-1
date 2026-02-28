/**
 * Fleet Rental Domain Models
 */

export interface Fleet {
  fleetId: string;
  name: string;
  taxNumber: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  vehicleId: string;
  fleetId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  currentMileage: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
  nextMaintenanceKm: number;
  nextMaintenanceDate: string; // ISO date
  riskScore: number; // 0-100
}

export interface RentalContract {
  contractId: string;
  fleetId: string;
  vehicleId: string;
  customerName: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  dailyRate: number; // TRY
  monthlyRate: number; // TRY
  kmLimit: number;
  depositAmount: number; // TRY
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface FleetKpi {
  activeContracts: number;
  upcomingMaintenance: number;
  monthlyRevenue: number;
  avgRiskScore: number;
}

export interface CreateContractPayload {
  vehicleId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  kmLimit: number;
  depositAmount: number;
  dailyRate: number;
  monthlyRate: number;
}

// ===== Vehicle Summary Types (V2.1) =====

export interface RiskSummary {
  score: number;
  flags: string[];
  reasonCodes?: string[];
}

export interface MaintenanceItem {
  maintenanceId: string;
  serviceDate: string;
  mileageAtService: number;
  serviceType: 'Routine' | 'Breakdown' | 'Recall' | 'Other';
  notes?: string;
  incurredCost?: number;
}

export interface CostBreakdown {
  category: 'Fuel' | 'Maintenance' | 'Insurance' | 'Fine' | 'Other';
  amount: number;
}

export interface PartsRecommendation {
  partId: string;
  partName: string;
  oem?: string;
  recommendedQty: number;
  confidence: number; // 0-1
  topOffer?: {
    supplierName: string;
    price: number;
    currency: 'TRY' | 'USD' | 'EUR';
    etaDays?: number;
  };
}

export interface ServicePoint {
  servicePointId: string;
  name: string;
  city: string;
  type: 'Authorized' | 'Partner';
  phone?: string;
}

export interface VehicleSummary {
  vehicleId: string;
  vin: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  currentMileage: number;

  risk: RiskSummary;

  maintenance: {
    nextMaintenanceKm: number;
    nextMaintenanceDate: string;
    upcoming: boolean;
    recent: MaintenanceItem[]; // son 3
  };

  costs: {
    last30DaysTotal: number;
    breakdown: CostBreakdown[];
  };

  parts: {
    recommendedOffersCount: number;
    topParts: PartsRecommendation[]; // top 3
  };

  service: {
    recommendedServicePoints: ServicePoint[]; // 2-3
  };
}

// ===== V2.2 SERVICE REDIRECT TYPES =====

// V2.5 - Trigger for routine maintenance redirects
export interface RoutineMaintenanceTrigger {
  source: 'MaintenanceDue' | 'Manual';
  dueReason?: 'KmDue' | 'DateDue';
  dueKmAtRedirect?: number;
  dueDateAtRedirect?: string; // ISO
}

// V2.5 - Incident context for breakdown redirects
export interface BreakdownIncident {
  incidentId: string;
  title: string;
  symptom: string; // required
  severity: 'Low' | 'Medium' | 'High';
  occurredAt: string; // ISO
  locationCity?: string;
}

export interface ServiceRedirect {
  redirectId: string;
  vehicleId: string;
  fleetId: string;
  vin: string;
  plateNumber: string;
  servicePointId: string;
  servicePointName: string;
  servicePointType: 'Authorized' | 'Partner';
  city: string;
  reason: 'Maintenance' | 'Breakdown' | 'Risk' | 'Other';
  note?: string;
  createdBy: string;
  createdAt: string; // ISO
  applyStatusChange: boolean;
  newStatus?: 'Serviced';
  workOrderId?: string; // V2.3 - Link to work order
  // V2.5 - Workflow types
  redirectType: 'RoutineMaintenance' | 'BreakdownIncident'; // V2.5
  trigger?: RoutineMaintenanceTrigger; // V2.5 - For RoutineMaintenance
  incident?: BreakdownIncident; // V2.5 - For BreakdownIncident
}

export interface FleetPolicy {
  fleetId: string;
  autoSetServicedOnRedirect: boolean; // user setting
  costApplyMode?: 'OnClose' | 'Manual'; // V2.4 - When to apply work order costs
  // V2.5 - Approval workflow locks
  routineRequiresApproval?: boolean; // false (LOCKED)
  breakdownRequiresApproval?: boolean; // true (LOCKED)
  extraWorkRequiresApproval?: boolean; // true (default)
  costApplyRequiresApproval?: boolean; // true (applies to all)
}

// V2.3 - Work Order Management
export interface WorkOrderLineItem {
  lineId: string;
  type: 'Labor' | 'Part';
  description: string;
  qty: number;
  unitPrice: number;
  currency: 'TRY' | 'USD' | 'EUR';
  scope?: 'Planned' | 'Extra'; // V2.5 - Default 'Planned'
}

// V2.5 - Approval workflow for work orders
export interface WorkOrderApproval {
  status: 'NotRequested' | 'Requested' | 'Approved' | 'Rejected';
  requestedAt?: string; // ISO
  requestedBy?: string;
  approvedAt?: string; // ISO
  approvedBy?: string;
  rejectedAt?: string; // ISO
  rejectedBy?: string;
  note?: string; // Optional notes from requestor/approver
  approvedExtraTotal?: number; // V2.5 - For Routine: partial extra approval. For Breakdown: total approved amount.
}

// V2.6 - Service Appointment (Randevu) from Maintenance module
export interface ServiceAppointment {
  appointmentId: string;
  tenantFleetId?: string; // Filo İD (FleetRental source için)
  source: 'FleetRental' | 'Individual' | 'Dealer';
  sourceRefId?: string; // redirectId if source=FleetRental
  vehicleId: string;
  vin: string;
  plateNumber: string;
  servicePointId: string;
  servicePointName: string;
  appointmentType: 'Routine' | 'Breakdown';
  scheduledAt?: string; // ISO - Randevu zamanı (opsiyon)
  arrivalMode: 'Appointment' | 'WalkIn';
  status: 'Scheduled' | 'Arrived' | 'Accepted' | 'Cancelled';
  tags?: string[]; // ör: ["PRIORITY_HIGH"]
  createdAt: string;
}

// V2.6 - Origin info for WorkOrder (from where, how)
export interface WorkOrderOrigin {
  channel: 'FleetRental' | 'Individual' | 'Dealer';
  arrivalMode: 'Appointment' | 'WalkIn';
}

export interface WorkOrder {
  workOrderId: string;
  vehicleId: string;
  fleetId: string;
  servicePointId: string;
  source: 'ServiceAppointment' | 'Manual'; // V2.6 - From ServiceAppointment or manual override
  sourceAppointmentId?: string; // V2.6 - Link to ServiceAppointment
  status: 'Open' | 'InProgress' | 'Closed';
  createdAt: string;
  // V2.4 - Cost Management
  lineItems?: WorkOrderLineItem[];
  totalAmount?: number;
  currency?: 'TRY' | 'USD' | 'EUR';
  costApplied?: boolean; // Has cost been written to ledger?
  // V2.5 - Workflow types and approval
  workOrderType?: 'Routine' | 'Breakdown'; // V2.5
  relatedRedirectId?: string; // V2.5 - Link to ServiceRedirect
  plannedTotal?: number; // V2.5 - Sum of 'Planned' scope items
  extraTotal?: number; // V2.5 - Sum of 'Extra' scope items
  approval?: WorkOrderApproval; // V2.5 - Approval tracking
  // V2.6 - Origin tracking
  origin?: WorkOrderOrigin; // V2.6 - Track channel and arrival mode
}

// V2.4 - Cost Ledger
export interface CostLedgerItem {
  costId: string;
  vehicleId: string;
  fleetId: string;
  category: 'Maintenance' | 'Insurance' | 'Fine' | 'Other' | 'Fuel';
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  date: string; // ISO
  source: 'WorkOrder' | 'Manual' | 'System';
  sourceRefId?: string; // workOrderId if source=WorkOrder
  notes?: string;
  createdAt: string;
}
