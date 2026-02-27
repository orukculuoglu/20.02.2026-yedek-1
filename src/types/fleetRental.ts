/**
 * Fleet Rental Domain Models
 * Covers: Fleets, Vehicles, Contracts, Maintenance, Costs, Risk, Service Points
 */

// ===== CORE ENTITIES =====

export interface Fleet {
  fleetId: string;           // UUID or stable key
  name: string;              // e.g., "Marmara Filo"
  taxNumber: string;         // Vergi numarası (unique)
  address: string;
  contactPerson: string;
  contactPhone: string;
  createdAt: string;         // ISO timestamp
  updatedAt: string;
}

export interface Vehicle {
  vehicleId: string;         // UUID
  fleetId: string;           // FK to Fleet
  plateNumber: string;       // Unique within fleet
  brand: string;             // Ford, Hyundai, etc.
  model: string;             // Transit, Santa Fe, etc.
  year: number;              // 2020, 2021, etc.
  vin: string;               // Vehicle Identification Number
  currentMileage: number;    // km
  status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
  nextMaintenanceKm: number; // Backup km-based trigger
  nextMaintenanceDate: string; // ISO date (time-based trigger)
}

export interface RentalContract {
  contractId: string;        // UUID
  fleetId: string;           // FK to Fleet
  vehicleId: string;         // FK to Vehicle
  customerName: string;
  startDate: string;         // ISO date
  endDate: string;           // ISO date
  dailyRate: number;         // ₺
  monthlyRate: number;       // = dailyRate * 22
  kmLimit: number;           // Total allowed km
  depositAmount: number;     // Caution money
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  maintenanceId: string;     // UUID
  vehicleId: string;         // FK to Vehicle
  mileageAtService: number;  // km
  serviceDate: string;       // ISO date
  serviceType: 'OIL_CHANGE' | 'TIRE_ROTATION' | 'BRAKE_CHECK' | 'INSPECTION' | 'REPAIR' | 'OTHER';
  notes: string;
  incurredCost: number;      // ₺
  sparePartsUsed: string[];  // Array of PartMaster IDs or descriptions
  recommendedWorkOrderId?: string;
}

export interface VehicleCost {
  costId: string;            // UUID
  vehicleId: string;         // FK to Vehicle
  category: 'MAINTENANCE' | 'INSURANCE' | 'FUEL' | 'FINE' | 'OTHER';
  amount: number;            // ₺
  currency: 'TRY' | 'USD' | 'EUR';
  date: string;              // ISO date
  note: string;
}

// ===== SAFETY & OPERATIONS =====

export interface FleetRiskSummary {
  fleetId: string;
  avgRiskScore: number;      // 0-100
  topRiskVehicles: Array<{
    vehicleId: string;
    vin: string;
    plateNumber: string;
    riskScore: number;
    reasonCodes: string[];   // e.g., ['OVERDUE_MAINTENANCE', 'HIGH_MILEAGE', 'ACCIDENT_HISTORY']
  }>;
}

export interface VehicleSummary {
  vehicle: Vehicle;
  risk: {
    score: number;           // 0-100
    flags: string[];         // Risk indicators
  };
  maintenance: {
    nextDueKm: number;
    nextDueDate: string;
    upcoming: boolean;       // true if < 7 days or < 500 km
    history: MaintenanceLog[];
  };
  costs: {
    monthTotal: number;      // Sum of costs in last 30 days
    breakdownByCategory: Record<string, number>; // e.g., {"MAINTENANCE": 5000, "FUEL": 12000}
  };
  parts: {
    recommendedOffersCount: number;
    topParts: Array<{
      partMasterId: string;
      partName: string;
      offersCount: number;
    }>;
  };
  service: {
    recommendedServicePoints: Array<{
      servicePointId: string;
      name: string;
      type: 'AUTHORIZED' | 'CONTRACTED' | 'PREFERRED';
      city: string;
      distance?: number; // km
    }>;
  };
}

// ===== API PAYLOADS =====

export interface CreateContractPayload {
  vehicleId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  monthlyRate: number;
  kmLimit: number;
  depositAmount: number;
}

export interface UpdateContractPayload {
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  endDate?: string;
}

export interface UpdateVehiclePayload {
  status?: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
  currentMileage?: number;
  nextMaintenanceKm?: number;
  nextMaintenanceDate?: string;
}

export interface AddMaintenancePayload {
  mileageAtService: number;
  serviceDate: string;
  serviceType: string;
  notes: string;
  incurredCost: number;
  sparePartsUsed?: string[];
}

export interface AddCostPayload {
  category: 'MAINTENANCE' | 'INSURANCE' | 'FUEL' | 'FINE' | 'OTHER';
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  date: string;
  note: string;
}

// ===== API RESPONSES =====

export interface FleetAPIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
