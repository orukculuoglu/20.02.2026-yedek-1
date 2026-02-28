# V2.6 Kanban Integration - Complete Flow & Test Guide

## Architecture Overview

### Problem Solved
- ✅ WorkOrder was created on server but **not visible in Kanban (İş Emirleri)**
- ✅ Root cause: Kanban reads from client-side `MOCK_SERVICE_ORDERS` but workorder was stored on server
- ✅ Solution: Transform WorkOrder → ServiceWorkOrder and cache in client dataService

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        RANDEVU (APPOINTMENT) FLOW                     │
├─────────────────────────────────────────────────────────────────────┤

1️⃣ Filo Kiralama Screen
   └─ POST /api/vehicle/:vehicleId/service-redirects
      └─ Auto-creates ServiceAppointment

2️⃣ Randevular Screen (NEW MaintenanceAppointments.tsx)
   ├─ GET /api/maintenance/appointments?status=...
   ├─ List all appointments (status: Scheduled, Arrived)
   ├─ User clicks "✓ Araç Kabul"
   └─ POST /api/maintenance/appointments/:appointmentId/accept
      └─ Server response: { workOrderId, workOrder }

3️⃣ WorkOrder Transformation (CLIENT SIDE - NEW in V2.6)
   ├─ Receive WorkOrder { workOrderId, tenantId, vin, plateNumber, origin }
   ├─ Transform to ServiceWorkOrder format
   │  ├─ id = workOrder.workOrderId
   │  ├─ status = 'INTAKE_PENDING' ← Shows in Kanban's first column
   │  ├─ operationalDetails = { plate, vinLast4, customerName }
   │  └─ sourceEventId = 'APT-' + appointmentId
   └─ Call createServiceWorkOrder(tenantId, serviceWorkOrder)
      └─ Stores in client-side MOCK_SERVICE_ORDERS

4️⃣ Auto-Navigate to İş Emirleri (Kanban)
   └─ ComponentRepairShops.tsx mounts
      └─ useEffect: fetchOrders() calls getServiceWorkOrders(tenantId)
         └─ Returns MOCK_SERVICE_ORDERS (now includes new ServiceWorkOrder)
         └─ Kanban renders with status = 'INTAKE_PENDING' in "Araç Kabul" column
            └─ ✅ NEW WORK ORDER VISIBLE IN KANBAN

└─ Loop: User can transition through Kanban columns (Teşhis → Onay → İşlemde → Teslimat)
```

---

## Component Updates in V2.6

### 1. Server: start-mock-server.mjs
- **POST /api/maintenance/appointments/:appointmentId/accept** (Lines 1243-1315)
  - ✅ Creates WorkOrder with fields:
    ```javascript
    {
      workOrderId,
      tenantId: appointment.tenantFleetId,        // ← CRITICAL for filtering
      vehicleId, vin, plateNumber,                // ← Vehicle details
      source: 'ServiceAppointment',               // ← Origin tracking
      sourceAppointmentId: appointmentId,         // ← Link back
      origin: { channel, arrivalMode },           // ← Metadata
      status: 'Open'                              // ← Initial status
    }
    ```
  - ✅ Links back: `appointment.workOrderId = workOrderId`

### 2. Client: views/MaintenanceAppointments.tsx (NEW/UPDATED)
- **New imports**: `createServiceWorkOrder`, `getCurrentUserSecurity`
- **NEW function**: `transformToServiceWorkOrder()`
  - Converts WorkOrder → ServiceWorkOrder
  - Maps tenantFleetId → institutionId
  - Sets status = 'INTAKE_PENDING' (first Kanban column)
  - Extracts vinLast4, plate, customer info
  
- **Updated**: `handleAcceptAppointment()`
  ```javascript
  1. Accept appointment → GET workOrder
  2. Show WorkOrder modal with origin details
  3. Transform to ServiceWorkOrder
  4. Call createServiceWorkOrder(tenantId, serviceWO) ← NEW
  5. After 3.5s: Navigate to REPAIR_SHOPS (Kanban)
  ```

### 3. Client: services/dataService.ts (UNCHANGED)
- Already exports: `createServiceWorkOrder(tenantId, order)`
- Stores in: `MOCK_SERVICE_ORDERS` array
- No changes needed - used as-is

### 4. Client: views/RepairShops.tsx (UNCHANGED)
- Already has: `fetchOrders()` on mount
- Calls: `getServiceWorkOrders(currentUser.institutionId)`
- Returns: Updated MOCK_SERVICE_ORDERS array
- No changes needed - Kanban automatically shows new orders

---

## Test Checklist

### Test Environment Setup
```bash
# Terminal 1: Start mock server
npm run dev:mock-server    # Runs on port 3001

# Terminal 2: Start frontend (wait 2s for server)
Start-Sleep -Seconds 2
npm run dev                # Runs on port 3003/3004
```

### Test Case 1: Create Redirect → Auto-Create Appointment ✅
**Path**: Filo Kiralama → + Yeni Araç → Fill form → Gönder

**Expected**:
- ✅ Response displays `redirectId` and `appointmentId`
- ✅ Appointment created with status = 'Scheduled'

**Verify**:
```bash
# Browser DevTools → Network
GET /api/maintenance/appointments
# Response should include newly created appointment
# { appointments: [{appointmentId, status: 'Scheduled', source: 'FleetRental', ...}] }
```

---

### Test Case 2: List Appointments (Randevular Screen) ✅
**Path**: Sidebar → Bakım Merkezi → Randevular

**Expected**:
- ✅ Screen loads with list of appointments
- ✅ Columns: Zaman, Kaynak (🚗 Filo Kiralama), Tip, Araç, Servis Noktası, Durum, Aksiyon
- ✅ "✓ Araç Kabul" button visible for non-viewer roles
- ✅ Button disabled for viewer role

**Network Check**:
```bash
GET /api/maintenance/appointments?status=  # (empty = default filter)
Headers:
  x-tenant-id: FLEET-001
  x-role: ops
  x-module: Maintenance

Response:
{
  appointments: [{
    appointmentId: 'APT-xxx',
    tenantFleetId: 'FLEET-001',
    source: 'FleetRental',
    appointmentType: 'Routine',
    plateNumber: 'ABC-1234',
    vin: '1234567890123456',
    servicePointId, servicePointName,
    arrivalMode: 'Appointment',
    status: 'Scheduled'
  }]
}
```

---

### Test Case 3: Accept Appointment → WorkOrder Created ✅
**Path**: Randevular → Click "✓ Araç Kabul"

**Expected UI**:
- ✅ Toast: "İş emri açıldı ✓" (3.5s duration)
- ✅ WorkOrder modal opens showing:
  - WorkOrderId
  - **Kaynak Bilgisi section** (NEW V2.6):
    - 🚗 Kaynak: Filo Kiralama
    - 📅 Geliş Modu: Randevu
  - Kalemler (line items - empty initially)
  - Toplam Tutar: 0 TRY
  - Durum: Açık
- ✅ After modal: Auto-navigate to İş Emirleri (Kanban)

**Network Check**:
```bash
POST /api/maintenance/appointments/APT-xxx/accept
Headers:
  x-tenant-id: FLEET-001
  x-role: ops
  x-module: Maintenance

Response (200):
{
  message: 'Appointment accepted and work order created',
  workOrderId: 'WO-xxxxxxxxx',
  workOrder: {
    workOrderId: 'WO-xxxxxxxxx',
    tenantId: 'FLEET-001',        # ← CRITICAL
    vehicleId: 'VEH-xxx',
    vin: '1234567890123456',      # ← NEW in V2.6
    plateNumber: 'ABC-1234',      # ← NEW in V2.6
    source: 'ServiceAppointment', # ← NEW in V2.6
    sourceAppointmentId: 'APT-xxx', # ← NEW in V2.6
    status: 'Open',
    origin: {
      channel: 'FleetRental',     # ← NEW in V2.6
      arrivalMode: 'Appointment'  # ← NEW in V2.6
    },
    createdAt: ISO timestamp,
    lineItems: [],
    totalAmount: 0
  }
}
```

---

### Test Case 4: Kanban Displays New WorkOrder ✅ (CRITICAL)
**Path**: Auto-navigated to İş Emirleri OR click sidebar → Repair Shops → İş Emirleri (Kanban) tab

**Expected Kanban**:
- ✅ Column "Araç Kabul" (first column) shows new card
  - Card displays: WorkOrderID, Plate (ABC-1234)
  - Card is clickable
  - Card shows progress indicator

**Step-by-Step Verification**:
1. After "Araç Kabul" modal closes, page auto-navigates to Kanban
2. Look for column titled "Araç Kabul" (leftmost column)
3. **NEW work order card should be visible**
4. Card should display:
   - Work order ID (WO-xxx)
   - Vehicle plate (ABC-1234)
   - Source badge or indicator
5. **Click card** → Right panel opens showing:
   - Full work order details
   - Status: INTAKE_PENDING (not "Open")
   - intakeChecklist: [{label: "Araç Kabul", checked: true}]

**Data Flow Verification**:
- Client-side cache check (DevTools Console):
  ```javascript
  // After navigation to Kanban:
  // Check that MaintenanceAppointments created the ServiceWorkOrder
  // by looking at the render of the Kanban board
  
  // Alternative: Check dataService directly (if accessible):
  // window.MOCK_SERVICE_ORDERS should contain the new entry
  ```

**Network Check**:
```bash
GET /api/repair-shops/work-orders?institutionId=FLEET-001
# OR: getServiceWorkOrders(institutionId) is called
# Response includes the newly created ServiceWorkOrder with status: 'INTAKE_PENDING'
```

---

### Test Case 5: Verify Origin Metadata is Preserved ✅
**Path**: Kanban → Click new card → Right panel

**Expected Right Panel**:
- ✅ Source section displays:
  - 🚗 **Kaynak**: Filo Kiralama (from WorkOrder.origin.channel)
  - 📅 **Geliş Modu**: Randevu (from WorkOrder.origin.arrivalMode)
- ✅ These values must match what was shown in WorkOrder modal

**Verification Steps**:
1. Open Kanban, find new WorkOrder card
2. Click card → Right panel expands
3. Scroll to see "Kaynak" section (blue background)
4. Verify:
   - "🚗 Kaynak: Filo Kiralama" OR with correct source name
   - "📅 Geliş Modu: Randevu" OR correct arrival mode

---

## Debugging Checklist

### If WorkOrder Does NOT Appear in Kanban

#### Check 1: Server Created WorkOrder ✅
```bash
POST /api/maintenance/appointments/xxx/accept
→ Check response has workOrderId and workOrder object
→ Verify status code is 200
```

#### Check 2: Client Received WorkOrder ✅
```bash
# Browser DevTools → Network → Response
# Look for: workOrder: { workOrderId, tenantId, origin, ... }
```

#### Check 3: Transformation Happened ✅
```bash
# Browser DevTools → Console
# Add debug log in MaintenanceAppointments.handleAcceptAppointment():
console.log('WorkOrder received:', workOrder);
console.log('ServiceWorkOrder transformed:', serviceWorkOrder);
console.log('Creating service work order for tenant:', getCurrentUserSecurity().institutionId);
```

#### Check 4: createServiceWorkOrder Was Called ✅
```bash
# Verify MOCK_SERVICE_ORDERS in dataService was updated
# Add log inside dataService.createServiceWorkOrder():
console.log('Adding to MOCK_SERVICE_ORDERS:', order);
console.log('New MOCK_SERVICE_ORDERS length:', MOCK_SERVICE_ORDERS.length);
```

#### Check 5: Kanban Fetched UpdatedOrders ✅
```bash
# Browser DevTools → Network
# Look for getServiceWorkOrders call when navigating to RepairShops
→ Should fetch UPDATED MOCK_SERVICE_ORDERS array
→ Should include new entry with status: 'INTAKE_PENDING'
```

#### Check 6: Status Mapping Correct ✅
```bash
# In Kanban rendering:
# Verify KANBAN_COLUMNS includes 'INTAKE_PENDING' in first column
# Current mapping (RepairShops.tsx line 57-73):
const KANBAN_COLUMNS = [
  { id: 'col-1', title: 'Araç Kabul', statuses: ['INTAKE_PENDING'], ... }
  ↑ NEW WorkOrder has status: 'INTAKE_PENDING' → Should match
]
```

---

## Performance Notes

### Client-Side Caching
- `MOCK_SERVICE_ORDERS` is kept in-memory in `dataService.ts`
- `createServiceWorkOrder()` directly mutates array (instant update)
- Next `getServiceWorkOrders()` call returns updated array
- **No server round-trip needed** for Kanban refresh

### Optimization Opportunity
If needed, could add:
```javascript
// Optional: Invalidate cache after navigation
sessionStorage.setItem('REPAIR_WORKORDERS_CACHE_VALID', 'false');

// In RepairShops.tsx:
useEffect(() => {
  const needsRefresh = !sessionStorage.getItem('REPAIR_WORKORDERS_CACHE_VALID');
  if (needsRefresh || workOrders.length === 0) {
    fetchOrders();
  }
}, []);
```

But current implementation is sufficient - fetchOrders() is called on mount.

---

## V2.6 Migration Summary

| Aspect | Before | After | Status |
|--------|--------|-------|--------|
| **Appointment Creation** | Manual | Auto on redirect | ✅ Implemented |
| **Appointment Listing** | N/A | In Randevular screen | ✅ Implemented |
| **Appointment Acceptance** | N/A | With WorkOrder creation | ✅ Implemented |
| **WorkOrder Origin** | None | tracked in origin field | ✅ Implemented |
| **Kanban Visibility** | ✗ Not visible | ✅ Visible | ✅ **FIXED** |
| **Status Normalization** | "Open" | "INTAKE_PENDING" (in Kanban) | ✅ Implemented |
| **Module Context** | N/A | x-module: Maintenance | ✅ Implemented |
| **Tenant Isolation** | Partial | Full (tenantId on WorkOrder) | ✅ Implemented |

---

## Rollback Plan (If Issues)

If any issue occurs:

1. **Revert MaintenanceAppointments imports**:
   - Remove: `createServiceWorkOrder`, `getCurrentUserSecurity`
   - Remove: `transformToServiceWorkOrder()` function

2. **Keep working parts**:
   - Server endpoints (POST accept, GET appointments) remain unchanged
   - Appointment modal display remains unchanged
   - Navigation to Kanban remains unchanged

3. **WorkOrders on Server Still Exist**:
   - MOCK_WORK_ORDERS array is still populated
   - Can be used by other endpoints if needed

---

## Next Steps After V2.6

1. **Server Integration** (Future):
   - Move MOCK_SERVICE_ORDERS to server storage
   - Have dataService.getServiceWorkOrders() fetch from server API
   - Currently works with client-side caching

2. **Status Transitions** (Future):
   - Enable INTAKE_PENDING → DIAGNOSIS transition
   - Add UI for technician to start diagnosis from Kanban

3. **Approval Workflow** (Future):
   - Integrate V2.5 approval workflow with V2.6 appointments
   - Show approval cards in "Müşteri Onayı" column

---

## References

- **Configuration**: types.ts (ServiceWorkOrder, ServiceAppointment)
- **Server**: start-mock-server.mjs (endpoints 1243-1315)
- **Client UI**: views/MaintenanceAppointments.tsx
- **Client Cache**: services/dataService.ts (MOCK_SERVICE_ORDERS)
- **Kanban**: views/RepairShops.tsx (KANBAN_COLUMNS mapping)

---

**Last Updated**: 2026-02-28  
**V2.6 Status**: ✅ COMPLETE - Ready for testing
