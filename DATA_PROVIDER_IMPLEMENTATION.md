# Data Provider Architecture - Vehicle Intelligence Module

*Date: March 1, 2026*  
*Phase: 2-2, Step 2 - Data Provider Pattern Implementation*

## Overview

The Vehicle Intelligence module now uses a **Data Provider Pattern** to abstract data sources. This enables seamless switching between mock and real API data without breaking the UI or existing calculations.

### Architecture Diagram

```
VehicleIntelligencePanel.tsx
    ↓
  (await) getOrBuild()
    ↓
vehicleStore.ts (caching + localStorage)
    ↓
  (await) buildVehicleAggregate()
    ↓
getVehicleDataProvider()  ← Factory Pattern
    ↓
  ┌─────────────────────────────┐
  │   IVehicleDataProvider      │ (Interface)
  │   └─ fetchAll()             │
  └─────────────────────────────┘
    ↓                       ↓
MockVehicleDataProvider  ApiVehicleDataProvider
    ↓                       ↓
getMock*() functions     (TODO: API calls)
    ↓                       ↓
[Mock Data]              [Real API Data]
    ↓                       ↓
    └───────────┬───────────┘
                ↓
        risk calculations
                ↓
        kmIntelligence
                ↓
        indexes
                ↓
        VehicleAggregate
```

## File Structure

```
src/modules/vehicle-intelligence/
├── dataProviders/
│   ├── IVehicleDataProvider.ts         (Interface + type)
│   ├── MockVehicleDataProvider.ts      (Mock implementation)
│   ├── ApiVehicleDataProvider.ts       (API stub - TODO)
│   └── providerFactory.ts              (Factory + env selection)
├── vehicleAggregator.ts                (Updated: now uses provider)
├── vehicleStore.ts                     (Updated: now async)
├── mockDataSources.ts                  (KEPT: mock data generators)
└── [other files unchanged]

src/modules/auto-expert/pages/
└── VehicleIntelligencePanel.tsx        (Updated: await getOrBuild)
```

## Data Flow

### Current: Mock Mode (Default)

```
1. User loads vehicle in UI
2. handleLoadVehicle() calls:
   await getOrBuild(vehicleId, vin, plate)

3. vehicleStore checks cache:
   ✓ Found? Return cached aggregate
   ✗ Not found? Build new

4. buildVehicleAggregate() calls:
   const provider = getVehicleDataProvider()
   // Returns: MockVehicleDataProvider (default)

5. await provider.fetchAll(vehicleId, vin, plate)
   // Executes:
   - getMockKmHistory()
   - getMockOBD()
   - getMockInsurance()
   - getMockDamage()
   - getMockService()

6. Returns DataSourcesResult via Promise

7. Risk engine calculations (unchanged)

8. VIO generation (unchanged)

9. Saves to localStorage cache

10. UI displays same result as before ✓
```

### Future: API Mode

```
Set environment variable:
VITE_VEHICLE_DATA_SOURCE=api

After that:
1. getVehicleDataProvider() returns ApiVehicleDataProvider
2. await provider.fetchAll() calls real API endpoints:
   - GET /api/vehicles/{vehicleId}/km-history
   - GET /api/vehicles/{vehicleId}/obd-records
   - GET /api/vehicles/{vehicleId}/insurance-records
   - GET /api/vehicles/{vehicleId}/damage-records
   - GET /api/vehicles/{vehicleId}/service-records
3. Rest identical: same risk calculations, same UI ✓
```

## Console Output

### Mock Mode (Default)

```
[getVehicleDataProvider] Using MockVehicleDataProvider (default)
[VehicleAggregator] Building aggregate for ABC123 (12-ABC-345)
[VehicleAggregator] DataProvider=MockVehicleDataProvider
[VehicleAggregator]  - Data sources loaded: KM(36), OBD(2), Insurance(4), Damage(3), Service(8)
[VehicleAggregator]  - Metrics: OdometerAnomaly=false, Rollback=false...
[VehicleAggregator]  - Indexes: Trust=72, Reliability=65, Maintenance=78
[VehicleAggregator] ✓ Aggregate complete for 12-ABC-345
```

### API Mode (Future)

```
[getVehicleDataProvider] Using ApiVehicleDataProvider
[VehicleAggregator] Building aggregate for ABC123 (12-ABC-345)
[VehicleAggregator] DataProvider=ApiVehicleDataProvider
[VehicleAggregator]  - Data sources loaded: KM(155), OBD(8), Insurance(12), Damage(5), Service(24)
[VehicleAggregator]  - Metrics: OdometerAnomaly=false, Rollback=true...
[VehicleAggregator] ✓ Aggregate complete for 12-ABC-345
```

## Interface Definition

```typescript
// IVehicleDataProvider.ts
export interface DataSourcesResult {
  kmHistory: KmHistoryRecord[];
  obdRecords: ObdRecord[];
  insuranceRecords: InsuranceRecord[];
  damageRecords: DamageRecord[];
  serviceRecords: ServiceRecord[];
}

export interface IVehicleDataProvider {
  fetchAll(
    vehicleId: string,
    vin: string,
    plate: string
  ): Promise<DataSourcesResult>;
}
```

## Environment Configuration

### .env (Current)

```env
# No VITE_VEHICLE_DATA_SOURCE defined
# → Defaults to "mock"
VITE_USE_REAL_API=false  (unrelated to Vehicle Intelligence module)
```

### To Switch to API Mode (Future)

Add to .env:
```env
VITE_VEHICLE_DATA_SOURCE=api
```

or in .env.development vs .env.production if needed.

## Async Changes Required

### ✅ Already Updated

- `buildVehicleAggregate()` - now `async`
- `rebuildVehicleAggregate()` - now `async`
- `vehicleStore.getOrBuild()` - now `async`
- `vehicleStore.rebuild()` - now `async`
- `VehicleIntelligencePanel.handleLoadVehicle()` - now `async`

### Impact on UI

All operations remain **synchronous from user perspective**:
- `setIsLoading(true)` before await
- `setIsLoading(false)` after await
- Same `try-catch` error handling
- Same loading spinner display
- **No UX changes** ✓

## Implementing API Provider

### Step 1: Fill ApiVehicleDataProvider.ts

```typescript
// Replace TODO section with actual implementation
import { apiClient } from '../../../services/apiClient';

async fetchAll(vehicleId: string, vin: string, plate: string): Promise<DataSourcesResult> {
  const [kmHistory, obdRecords, insuranceRecords, damageRecords, serviceRecords] =
    await Promise.all([
      apiClient.get(`/api/vehicles/${vehicleId}/km-history`),
      apiClient.get(`/api/vehicles/${vehicleId}/obd-records`),
      apiClient.get(`/api/vehicles/${vehicleId}/insurance-records`),
      apiClient.get(`/api/vehicles/${vehicleId}/damage-records`),
      apiClient.get(`/api/vehicles/${vehicleId}/service-records`),
    ]);

  return {
    kmHistory,
    obdRecords,
    insuranceRecords,
    damageRecords,
    serviceRecords,
  };
}
```

### Step 2: Set Environment Variable

```env
VITE_VEHICLE_DATA_SOURCE=api
```

### Step 3: No Other Changes Required

- buildVehicleAggregate() already calls provider.fetchAll()
- Risk calculations already expect same data structure
- UI already uses async approach
- Cache already works with both

## Backwards Compatibility

✅ **100% Compatible**

- Mock data generators (`getMock*` functions) unchanged and still used
- Risk engine calculations haven't changed
- Type definitions unchanged
- UI flow unchanged (just now async)
- Cache mechanism unchanged
- Error handling unchanged
- All previous features work identically ✓

## Testing Checklist

- [x] Build: 0 TypeScript errors ✓
- [x] Default mode (mock): Console should log MockVehicleDataProvider
- [x] Mock data loads: Vehicle Intelligence panel shows same values as before
- [x] Cache working: Second vehicle load should be instant (from localStorage)
- [x] Error handling: Invalid vehicle ID shows error message
- [x] Loading state: Spinner shows during data fetch
- [x] VIO generation: Works after aggregate loads

## Deployment Notes

1. **Current Deployment**: Will use MockVehicleDataProvider automatically
2. **No environment changes needed** unless switching to real API
3. **Console logs help debugging**: Check `[VehicleAggregator] DataProvider=` log
4. **Zero runtime breaking changes** ✓

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Build | ✅ | 0 errors, 2451 modules |
| UI | ✅ | No changes, same flow |
| Mock data | ✅ | 100% preserved and working |
| API integration | 🔓 | Ready for implementation |
| Async changes | ✅ | All propagated through stack |
| Error handling | ✅ | Fallback aggregate on provider error |
| Cache | ✅ | Works with both mock and API |
| Environment | ✅ | Optional VITE_VEHICLE_DATA_SOURCE var |

---

**Next Phase**: When real API endpoints are ready, fill ApiVehicleDataProvider.fetchAll() with actual API calls. No other changes needed.
