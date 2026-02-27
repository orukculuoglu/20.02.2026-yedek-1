import type { Fleet, Vehicle, RentalContract, CreateContractPayload, VehicleSummary, FleetPolicy, ServiceRedirect, WorkOrder, CostLedgerItem, WorkOrderLineItem, ServiceAppointment } from '../types/fleetRental';

// Relative API base - handled by dev proxy
const API_BASE = '/api';

// Global context (will be set by UI component)
let currentTenant = 'FLEET-001';
let currentRole = 'ops';

export function setContext(tenant: string, role: string) {
  currentTenant = tenant;
  currentRole = role;
}

export function getContext() {
  return { tenant: currentTenant, role: currentRole };
}

/**
 * Get required headers for fleet endpoints
 */
function getTenantHeaders(): Record<string, string> {
  return {
    'x-tenant-id': currentTenant,
    'x-role': currentRole,
  };
}

/**
 * List all available fleets
 */
export async function listFleets(): Promise<Fleet[]> {
  const response = await fetch(`${API_BASE}/fleet`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch fleets: ${response.status}`);
  }

  return response.json();
}

/**
 * List vehicles for a specific fleet
 */
export async function listVehicles(fleetId: string): Promise<Vehicle[]> {
  const response = await fetch(`${API_BASE}/fleet/${fleetId}/vehicles`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vehicles for fleet ${fleetId}: ${response.status}`);
  }

  return response.json();
}

/**
 * List rental contracts for a specific fleet
 */
export async function listContracts(fleetId: string): Promise<RentalContract[]> {
  const response = await fetch(`${API_BASE}/fleet/${fleetId}/contracts`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch contracts for fleet ${fleetId}: ${response.status}`);
  }

  return response.json();
}

/**
 * Create a new rental contract for a fleet
 */
export async function createContract(
  fleetId: string,
  payload: CreateContractPayload
): Promise<RentalContract> {
  const response = await fetch(`${API_BASE}/fleet/${fleetId}/contracts`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create contract for fleet ${fleetId}: ${response.status}`);
  }

  return response.json();
}

/**
 * Get vehicle summary (V2.1) - Includes risk, maintenance, costs, parts, service
 */
export async function getVehicleSummary(vehicleId: string): Promise<VehicleSummary> {
  const response = await fetch(`${API_BASE}/vehicle/${vehicleId}/summary`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch vehicle summary for ${vehicleId}: ${response.status}`);
  }

  return response.json();
}

/**
 * Get fleet policy (V2.2) - Read-only, no role check needed
 */
export async function getFleetPolicy(fleetId: string): Promise<FleetPolicy> {
  const response = await fetch(`${API_BASE}/fleet/${fleetId}/policy`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch fleet policy for ${fleetId}: ${response.status}`);
  }

  return response.json();
}

/**
 * Update fleet policy (V2.2) - Can auto-set Serviced on redirects
 * Throws 403 if role is 'viewer'
 */
export async function updateFleetPolicy(
  fleetId: string,
  policy: { autoSetServicedOnRedirect: boolean }
): Promise<FleetPolicy> {
  const response = await fetch(`${API_BASE}/fleet/${fleetId}/policy`, {
    method: 'PATCH',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(policy),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer role cannot modify fleet policy');
    }
    throw new Error(`Failed to update fleet policy for ${fleetId}: ${response.status}`);
  }

  return response.json();
}

/**
 * List service redirects for a vehicle (V2.2) - Read-only, no role check needed
 */
export async function listServiceRedirects(vehicleId: string): Promise<ServiceRedirect[]> {
  const response = await fetch(`${API_BASE}/vehicle/${vehicleId}/service-redirects`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch service redirects for ${vehicleId}: ${response.status}`);
  }

  return response.json();
}

/**
 * Create service redirect for a vehicle (V2.5) - Supports RoutineMaintenance and BreakdownIncident
 * Throws 403 if role is 'viewer'
 */
export async function createServiceRedirect(
  vehicleId: string,
  payload: {
    servicePointId: string;
    redirectType: 'RoutineMaintenance' | 'BreakdownIncident';
    reason: string;
    applyStatusChange?: boolean;
    trigger?: {
      source: string;
      dueReason?: string;
      dueKmAtRedirect?: number;
      dueDateAtRedirect?: string;
    };
    incident?: {
      incidentId: string;
      title?: string;
      symptom: string;
      severity: 'Low' | 'Medium' | 'High';
      occurredAt: string;
      locationCity?: string;
    };
  }
): Promise<{ redirect: ServiceRedirect; updatedVehicle?: Vehicle }> {
  const response = await fetch(`${API_BASE}/vehicle/${vehicleId}/service-redirects`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer role cannot create service redirects');
    }
    if (response.status === 404) {
      throw new Error(`Vehicle not found: ${vehicleId}`);
    }
    if (response.status === 400) {
      const err = await response.json();
      throw new Error(err.error || `Validation error: ${response.status}`);
    }
    throw new Error(`Failed to create service redirect for ${vehicleId}: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.3 - Create work order from service redirect
 */
export async function createWorkOrder(
  redirectId: string
): Promise<{ workOrderId: string; status: string }> {
  const response = await fetch(`${API_BASE}/service-redirects/${redirectId}/create-workorder`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer role cannot create work orders');
    }
    if (response.status === 404) {
      throw new Error('Service redirect not found');
    }
    if (response.status === 409) {
      throw new Error('Work order already exists for this redirect');
    }
    throw new Error(`Failed to create work order: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.3 - List work orders (optionally filtered by fleetId)
 */
export async function listWorkOrders(fleetId?: string): Promise<WorkOrder[]> {
  const params = fleetId ? `?fleetId=${fleetId}` : '';
  const response = await fetch(`${API_BASE}/workorders${params}`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch work orders: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.4 - Get single work order details
 */
export async function getWorkOrder(workOrderId: string): Promise<WorkOrder> {
  const response = await fetch(`${API_BASE}/workorders/${workOrderId}`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch work order: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.4 - Update work order (status, etc.)
 */
export async function updateWorkOrder(
  workOrderId: string,
  payload: { status?: 'Open' | 'InProgress' | 'Closed' }
): Promise<WorkOrder> {
  const response = await fetch(`${API_BASE}/workorders/${workOrderId}`, {
    method: 'PATCH',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer role cannot modify work orders');
    }
    if (response.status === 404) {
      throw new Error('Work order not found');
    }
    throw new Error(`Failed to update work order: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.4 - Add line item to work order
 */
export async function addLineItem(
  workOrderId: string,
  lineItem: {
    type: 'Labor' | 'Part';
    description: string;
    qty: number;
    unitPrice: number;
    currency: 'TRY' | 'USD' | 'EUR';
  }
): Promise<{ lineId: string; totalAmount: number }> {
  const response = await fetch(`${API_BASE}/workorders/${workOrderId}/line-items`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lineItem),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer role cannot add line items');
    }
    if (response.status === 404) {
      throw new Error('Work order not found');
    }
    throw new Error(`Failed to add line item: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.4 - Apply work order cost to ledger (V2.5 approval gates enforced on server)
 */
export async function applyCost(workOrderId: string): Promise<{ costId: string; amount: number }> {
  const response = await fetch(`${API_BASE}/workorders/${workOrderId}/apply-cost`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to apply cost: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Can't parse error details
    }

    if (response.status === 403) {
      throw new Error('Forbidden: Viewer role cannot apply costs');
    }
    if (response.status === 404) {
      throw new Error('Work order not found');
    }
    if (response.status === 409) {
      // 409 can be: already applied, not closed, approval required, etc.
      throw new Error(`409: ${errorMessage}`);
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * V2.4 - Get cost ledger for a vehicle
 */
export async function getCostLedger(vehicleId: string): Promise<CostLedgerItem[]> {
  // This endpoint doesn't exist yet, but we can implement it as needed
  // For now, return empty array
  return [];
}

/**
 * V2.4 - Update fleet policy with costApplyMode
 */
export async function updateFleetPolicyWithCosts(
  fleetId: string,
  payload: { autoSetServicedOnRedirect?: boolean; costApplyMode?: 'OnClose' | 'Manual' }
): Promise<FleetPolicy> {
  const response = await fetch(`${API_BASE}/fleet/${fleetId}/policy`, {
    method: 'PATCH',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update fleet policy: ${response.status}`);
  }

  return response.json();
}
// ===== V2.5 - APPROVAL WORKFLOW =====

/**
 * V2.5 - Request approval for a work order
 */
export async function requestApproval(workOrderId: string): Promise<{ message: string; approval: any }> {
  const response = await fetch(`${API_BASE}/workorders/${workOrderId}/request-approval`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer role cannot request approval');
    }
    if (response.status === 404) {
      throw new Error('Work order not found');
    }
    throw new Error(`Failed to request approval: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.5 - Approve a work order (with optional approvedExtraTotal for Routine)
 */
export async function approveWorkOrder(
  workOrderId: string,
  payload: { approvedExtraTotal?: number; note?: string }
): Promise<{ message: string; approval: any }> {
  const response = await fetch(`${API_BASE}/workorders/${workOrderId}/approve`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer cannot approve');
    }
    if (response.status === 404) {
      throw new Error('Work order not found');
    }
    if (response.status === 400) {
      const err = await response.json();
      throw new Error(err.error || 'Invalid approval payload');
    }
    throw new Error(`Failed to approve: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.5 - Reject a work order
 */
export async function rejectWorkOrder(
  workOrderId: string,
  note: string
): Promise<{ message: string; approval: any }> {
  const response = await fetch(`${API_BASE}/workorders/${workOrderId}/reject`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note }),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer cannot reject');
    }
    if (response.status === 404) {
      throw new Error('Work order not found');
    }
    if (response.status === 400) {
      const err = await response.json();
      throw new Error(err.error || 'Invalid rejection payload');
    }
    throw new Error(`Failed to reject: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.6 - Get service appointments (Maintenance module)
 */
export async function getAppointments(statusFilter?: string): Promise<any> {
  const params = new URLSearchParams();
  if (statusFilter) {
    params.append('status', statusFilter);
  }

  const response = await fetch(`${API_BASE}/maintenance/appointments?${params.toString()}`, {
    method: 'GET',
    headers: {
      ...getTenantHeaders(),
      'x-module': 'Maintenance', // V2.6 - Module header
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: You must have Maintenance module access');
    }
    throw new Error(`Failed to fetch appointments: ${response.status}`);
  }

  return response.json();
}

/**
 * V2.6 - Accept an appointment (creates WorkOrder)
 */
export async function acceptAppointment(appointmentId: string): Promise<{ workOrderId: string; workOrder: WorkOrder }> {
  const response = await fetch(`${API_BASE}/maintenance/appointments/${appointmentId}/accept`, {
    method: 'POST',
    headers: {
      ...getTenantHeaders(),
      'x-module': 'Maintenance', // V2.6 - Module header
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Viewer cannot accept appointments');
    }
    if (response.status === 404) {
      throw new Error('Appointment not found');
    }
    throw new Error(`Failed to accept appointment: ${response.status}`);
  }

  return response.json();
}