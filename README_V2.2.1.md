# V2.2.1 Quick Reference

## Summary
Status change verification implemented. Service redirects now properly show whether status did or didn't change, with immediate UI updates.

---

## What Changed

### 1️⃣ Seed Data
- Removed SR-002 redirect from VEH-002
- VEH-004 (Renault) ready for clean testing
- VEH-005 (Iveco) ready for clean testing

### 2️⃣ Server
- `POST /api/vehicle/:vehicleId/service-redirects` now always returns:
  ```json
  { 
    updatedVehicle: { 
      vehicleId, 
      status,              // ← ALWAYS included
      applyStatusChange 
    } 
  }
  ```

### 3️⃣ UI  
- Always refetch summary (not just if status changes)
- Added blue badge for "Serviced" status
- Green badge for "ACTIVE" status
- Immediate visual feedback

---

## Test Scenarios

### Scenario 1: Policy OFF (Status Unchanged)
```
Vehicle: VEH-004 (Status: ACTIVE)
Policy: OFF
Create redirect → applyStatusChange=false
Result: Status stays ACTIVE ✅
```

### Scenario 2: Policy ON (Status Changed)
```
Vehicle: VEH-005 (Status: ACTIVE)  
Policy: ON
Create redirect → applyStatusChange=true
Result: Status becomes Serviced ✅
```

---

## Verify in Browser

1. Open http://localhost:3003
2. Select Marmara Filo
3. Click on VEH-004 (Renault) from list
4. Click "Araç Özeti" tab
5. Follow either scenario above
6. Watch status badge change (or stay same)
7. Open DevTools F12 → Network tab to see calls

---

## Key Files

| File | Change |
|------|--------|
| fleetRentalSeed.ts | Removed SR-002 |
| fleetRentalSeed.mjs | Removed SR-002 |
| start-mock-server.mjs | Always return updatedVehicle |
| FleetRental.tsx | Always refetch + SERVICED badge |

---

## Status Badges

| Status | Color | When |
|--------|-------|------|
| ACTIVE | Green | Vehicle running |
| SERVICED | Blue | **NEW** - Redirect sent with status change |
| MAINTENANCE | Orange | Under maintenance |

---

## Endpoints

### GET /api/vehicle/:vehicleId/service-redirects
Returns list of redirects for vehicle

### POST /api/vehicle/:vehicleId/service-redirects
```json
Request: {
  servicePointId: "SP-001",
  reason: "Maintenance|Breakdown|Risk|Other",
  note: "Optional",
  applyStatusChange: true/false
}

Response: {
  redirect: { ... },
  updatedVehicle: {
    vehicleId: "VEH-004",
    status: "ACTIVE" or "Serviced",
    applyStatusChange: true/false
  }
}
```

---

## Verification Commands

```powershell
# Test 1: Status NOT changed
$h = @{"x-tenant-id"="FLEET-001";"x-role"="ops";"Content-Type"="application/json"}
$b = '{"servicePointId":"SP-007","reason":"Maintenance","applyStatusChange":false}'
Invoke-WebRequest "http://localhost:3001/api/vehicle/VEH-004/service-redirects" -Method Post -Headers $h -Body $b

# Expected response contains: "status": "ACTIVE", "applyStatusChange": false

# Test 2: Status CHANGED  
$b = '{"servicePointId":"SP-009","reason":"Breakdown","applyStatusChange":true}'
Invoke-WebRequest "http://localhost:3001/api/vehicle/VEH-005/service-redirects" -Method Post -Headers $h -Body $b

# Expected response contains: "status": "Serviced", "applyStatusChange": true
```

---

## Network Flow (DevTools)

### Success Flow
```
1. Click "Yönlendir" button
   ↓
2. Fill modal form
   ↓
3. Click "Kaydet"
   ↓
4. POST /api/vehicle/VEH-004/service-redirects → 200
   {"updatedVehicle": {status: "ACTIVE"}}
   ↓
5. GET /api/vehicle/VEH-004/summary → 200  
   {"status": "ACTIVE"}
   ↓
6. UI updates badge (immediate)
   ↓
7. Toast: "Yönlendirme kaydedildi"
```

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| Badge doesn't update | DevTools → Components tab → vehicleSummary state |
| GET summary not called | DevTools → Network tab, filter by "summary" |
| Status wrong in response | Check applyStatusChange flag in POST body |
| Vehicle not found | Verify VEH-ID exists in vehicle list |
| Service point 404 | Check SP-ID matches vehicle's service points |

---

## Success Indicators 🎯

- ✅ Can create redirect with status unchanged
- ✅ Can create redirect with status changed
- ✅ Badge shows different colors
- ✅ Network shows POST then GET
- ✅ Both scenarios testable on same vehicle
- ✅ UI updates immediately (< 2 sec)

---

## Documentation Files

1. **V2.2.1_COMPLETE.md** - Full technical details
2. **V2.2.1_CHANGES.md** - What was modified
3. **V2.2.1_TEST_FLOW.md** - Step-by-step testing
4. **test-v2.2.1.mjs** - Automated test script

Select any of these for detailed information.
